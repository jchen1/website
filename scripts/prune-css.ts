import crypto from "crypto";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import postcss, { AtRule, ChildNode, Container, Rule } from "postcss";
import selectorParser from "postcss-selector-parser";

// Removes CSS rules that cannot match anything the site can ever render.
// The site is fully static: after `next build`, .next/server/pages/**/*.html
// is every page that can be served, and .next/static/chunks/**/*.js contains
// (as string literals) every class name client code can add at runtime — the
// css-module class-name minifier means JS carries the same minified names as
// the CSS. The union of tokens in those files is therefore a sound
// over-approximation of every class/id a selector could ever match; selectors
// requiring a class or id outside that set are dead.
//
// Cache safety: /_next/static/* is served immutable, and pruned bytes depend
// on site content, so a pruned file must never keep its old content-hashed
// name. Every css file whose bytes change is re-hashed to a new filename and
// all references to the old name (prerendered HTML, build manifests, the
// out/ mirror on static export) are rewritten. Css files loaded by the
// webpack runtime from inside JS chunks cannot be renamed without editing
// immutable JS, so they are skipped entirely.
//
// The token and reference model is pages-router-specific: it assumes every
// renderable page lives in .next/server/pages/**/*.html and every stylesheet
// reference lives in that HTML or the build manifests. An App Router
// migration (RSC payloads, .next/server/app, flight data) would break both
// assumptions and this script must be revisited before one.

// Classes that may be constructed at runtime by string concatenation instead
// of appearing verbatim anywhere in the build output. uPlot derives its
// class names from a "u-" prefix, so its selectors are exempt from pruning.
// This is an inherent limitation of the token model: a class assembled at
// runtime ("prefix-" + x) never appears verbatim in any build artifact, so
// the extractor cannot see it — such names must be safelisted here.
const SAFELIST: RegExp[] = [/^u-/, /^uplot$/];

const TOKEN_RE = /[A-Za-z0-9_-]+/g;

function walkFiles(
  dir: string,
  extensions: string[],
  onFile: (f: string) => void,
  exclude: string[] = [],
) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (exclude.includes(full)) continue;
    if (entry.isDirectory()) walkFiles(full, extensions, onFile, exclude);
    else if (extensions.some(ext => entry.name.endsWith(ext))) onFile(full);
  }
}

function collectTokens(text: string, tokens: Set<string>) {
  for (const token of text.match(TOKEN_RE) ?? []) {
    tokens.add(token);
    // `a-b` in JS may be an expression over identifiers `a` and `b` rather
    // than one hyphenated name; index the fragments too so real class names
    // are never missed.
    if (token.includes("-") || token.includes("_"))
      for (const part of token.split(/[-_]+/)) if (part) tokens.add(part);
  }
}

const isSafelisted = (name: string) => SAFELIST.some(re => re.test(name));

// A selector is live unless it requires a class or id that appears nowhere in
// the build output. Classes inside functional pseudos (:not, :is, …) are
// ignored: `.a:not(.dead)` still matches plain `.a` elements. Selectors with
// no class/id requirement (element, attribute, pseudo, :root, ::selection)
// are always kept.
function selectorIsLive(selector: string, tokens: Set<string>): boolean {
  // The token set only indexes ASCII word characters, so a selector with a
  // non-ASCII character or a CSS escape sequence names something the
  // extractor cannot prove dead — keep it unconditionally.
  if (selector.includes("\\") || /[^\t\n\r\x20-\x7e]/.test(selector))
    return true;
  let live = true;
  const ast = selectorParser().astSync(selector);
  ast.walk(node => {
    if (node.type !== "class" && node.type !== "id") return;
    for (let p = node.parent; p; p = p.parent as typeof p.parent)
      if ((p as { type?: string }).type === "pseudo") return;
    if (isSafelisted(node.value)) return;
    if (!tokens.has(node.value)) live = false;
  });
  return live;
}

interface FileStats {
  file: string;
  rulesDropped: number;
  selectorsDropped: string[];
  rawBefore: number;
  rawAfter: number;
  gzBefore: number;
  gzAfter: number;
}

const isKeyframes = (node: ChildNode): node is AtRule =>
  node.type === "atrule" && node.name.endsWith("keyframes");

function pruneContainer(
  container: Container,
  tokens: Set<string>,
  stats: FileStats,
) {
  for (const node of [...(container.nodes ?? [])] as ChildNode[]) {
    if (node.type === "rule") {
      const rule = node as Rule;
      const kept = rule.selectors.filter(s => selectorIsLive(s, tokens));
      const dropped = rule.selectors.filter(s => !kept.includes(s));
      stats.selectorsDropped.push(...dropped);
      if (kept.length === 0) {
        rule.remove();
        stats.rulesDropped++;
      } else if (dropped.length > 0) {
        rule.selectors = kept;
      }
    } else if (node.type === "atrule" && !isKeyframes(node)) {
      const atRule = node as AtRule;
      if (atRule.name === "font-face") continue;
      if (atRule.nodes) {
        pruneContainer(atRule, tokens, stats);
        // An emptied @layer block still declares the layer: layer order is
        // fixed by first appearance, so removing it could flip the cascade.
        if (atRule.nodes.length === 0 && atRule.name.toLowerCase() !== "layer")
          atRule.remove();
      }
    }
  }
}

// Every ident in a kept animation/animation-name value is treated as a
// possibly-referenced keyframes name (over-approximation: shorthand keywords
// like `linear` or `infinite` just keep a same-named @keyframes alive).
function collectAnimationNames(root: Container, names: Set<string>) {
  root.walkDecls(/^(-\w+-)?animation(-name)?$/, decl => {
    for (const ident of decl.value.match(TOKEN_RE) ?? []) names.add(ident);
  });
}

// A @keyframes rule is live if its name appears in a kept animation
// declaration or anywhere in the build output's token set (inline styles and
// JS-assigned animations reference names outside any CSS declaration). A
// var() in any kept declaration can also smuggle an animation name through a
// custom property, hiding it from both scans; such a stylesheet keeps every
// @keyframes it contains.
function pruneKeyframes(
  root: Container,
  animationNames: Set<string>,
  tokens: Set<string>,
  stats: FileStats,
) {
  let usesVar = false;
  root.walkDecls(decl => {
    if (decl.value.includes("var(")) usesVar = true;
  });
  if (usesVar) {
    let kept = 0;
    root.walkAtRules(/keyframes$/, () => {
      kept++;
    });
    if (kept > 0)
      console.log(
        `prune-css: ${stats.file} keeps all ${kept} @keyframes ` +
          `(a kept declaration uses var())`,
      );
    return;
  }
  root.walkAtRules(/keyframes$/, atRule => {
    const name = atRule.params.trim();
    if (!animationNames.has(name) && !tokens.has(name)) {
      stats.selectorsDropped.push(`@${atRule.name} ${atRule.params}`);
      atRule.remove();
      stats.rulesDropped++;
    }
  });
}

// Rewrites path-qualified references ("static/css/<name>") to renamed css
// files in the only artifacts that legitimately load a stylesheet:
// prerendered HTML plus the _buildManifest.js / build-manifest.json build
// manifests. Nothing else is touched — JS-referenced stylesheets are never
// renamed, so JS chunks never need rewriting, and a bare filename in page
// text (an article that merely displays a hashed css name) must stay as the
// author wrote it. .next/cache is webpack's own state, not served output.
const REWRITE_MANIFESTS = ["_buildManifest.js", "build-manifest.json"];

function rewriteReferences(
  roots: { dir: string; exclude: string[] }[],
  renames: Map<string, string>,
): number {
  if (renames.size === 0) return 0;
  let rewritten = 0;
  for (const { dir, exclude } of roots) {
    walkFiles(
      dir,
      [".html", ".js", ".json"],
      file => {
        if (
          !file.endsWith(".html") &&
          !REWRITE_MANIFESTS.includes(path.basename(file))
        )
          return;
        const text = fs.readFileSync(file, "utf8");
        let updated = text;
        for (const [oldName, newName] of renames)
          updated = updated
            .split(`static/css/${oldName}`)
            .join(`static/css/${newName}`);
        if (updated !== text) {
          fs.writeFileSync(file, updated);
          rewritten++;
        }
      },
      exclude,
    );
  }
  return rewritten;
}

function main() {
  const started = Date.now();
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const nextDir = path.join(root, ".next");
  const cssDir = path.join(nextDir, "static", "css");
  if (!fs.existsSync(cssDir)) {
    console.log("prune-css: no .next/static/css directory, nothing to do");
    return;
  }

  const tokens = new Set<string>();
  const chunkTexts: string[] = [];
  walkFiles(path.join(nextDir, "server", "pages"), [".html"], f =>
    collectTokens(fs.readFileSync(f, "utf8"), tokens),
  );
  walkFiles(path.join(nextDir, "static", "chunks"), [".js"], f => {
    const text = fs.readFileSync(f, "utf8");
    chunkTexts.push(text);
    collectTokens(text, tokens);
  });

  const cssFiles = fs
    .readdirSync(cssDir)
    .filter(f => f.endsWith(".css"))
    .map(f => path.join(cssDir, f));

  // A cross-file @import means one stylesheet names another by its hashed
  // filename, which renaming would break. Pages-router builds never emit
  // one, so its presence means the build model changed: leave every file
  // untouched (any byte change would require a rename).
  const withImport = cssFiles.filter(f =>
    /@import/i.test(fs.readFileSync(f, "utf8")),
  );
  if (withImport.length > 0) {
    console.log(
      `prune-css: SKIPPING ALL PRUNING AND RENAMING — @import found in ` +
        withImport.map(f => path.basename(f)).join(", "),
    );
    return;
  }

  // Css files the webpack runtime loads from JS carry their content hash
  // inside immutable chunk code (as `hash + ".css"`), so they can be neither
  // pruned nor renamed. Their stylesheets still contribute animation names.
  const prunable: string[] = [];
  const skippedAsts: Container[] = [];
  for (const file of cssFiles) {
    const hash = path.basename(file, ".css");
    if (chunkTexts.some(text => text.includes(hash))) {
      console.log(
        `prune-css: ${path.basename(file)} skipped (referenced from a JS chunk)`,
      );
      skippedAsts.push(postcss.parse(fs.readFileSync(file, "utf8")));
    } else {
      prunable.push(file);
    }
  }

  // First pass: prune rules per file, keeping the parsed roots around so
  // @keyframes can be resolved against animation names kept in ANY file.
  const parsed = prunable.map(file => {
    const css = fs.readFileSync(file, "utf8");
    const stats: FileStats = {
      file: path.basename(file),
      rulesDropped: 0,
      selectorsDropped: [],
      rawBefore: Buffer.byteLength(css),
      rawAfter: 0,
      gzBefore: zlib.gzipSync(css).length,
      gzAfter: 0,
    };
    const ast = postcss.parse(css, { from: file });
    pruneContainer(ast, tokens, stats);
    return { file, ast, stats };
  });

  const animationNames = new Set<string>();
  for (const { ast } of parsed) collectAnimationNames(ast, animationNames);
  for (const ast of skippedAsts) collectAnimationNames(ast, animationNames);

  const outDir = path.join(root, "out");
  const exportCssDir = path.join(outDir, "_next", "static", "css");
  const renames = new Map<string, string>();
  for (const { file, ast, stats } of parsed) {
    pruneKeyframes(ast, animationNames, tokens, stats);
    const output = ast.toResult().css;
    stats.rawAfter = Buffer.byteLength(output);
    stats.gzAfter = zlib.gzipSync(output).length;
    if (stats.rawAfter !== stats.rawBefore) {
      // The bytes changed, so the old content-hashed immutable filename must
      // not survive: emit under a fresh hash and drop the original.
      const oldName = path.basename(file);
      const newName =
        crypto.createHash("sha256").update(output).digest("hex").slice(0, 16) +
        ".css";
      renames.set(oldName, newName);
      fs.writeFileSync(path.join(cssDir, newName), output);
      fs.rmSync(file);
      // Static export copies css into out/ before this script runs; mirror
      // the rename there with the identical pruned bytes.
      const exported = path.join(exportCssDir, oldName);
      if (fs.existsSync(exported)) {
        fs.writeFileSync(path.join(exportCssDir, newName), output);
        fs.rmSync(exported);
      }
      console.log(`prune-css: renamed ${oldName} -> ${newName}`);
    }
    console.log(
      `prune-css: ${stats.file} raw ${stats.rawBefore} -> ${stats.rawAfter}, ` +
        `gz ${stats.gzBefore} -> ${stats.gzAfter}, ` +
        `${stats.rulesDropped} rules / ${stats.selectorsDropped.length} selectors dropped`,
    );
    for (const selector of stats.selectorsDropped)
      console.log(`  - ${selector}`);
  }

  const rewritten = rewriteReferences(
    [
      {
        dir: nextDir,
        exclude: [
          path.join(nextDir, "cache"),
          path.join(nextDir, "static", "chunks"),
        ],
      },
      {
        dir: outDir,
        exclude: [path.join(outDir, "_next", "static", "chunks")],
      },
    ],
    renames,
  );
  console.log(
    `prune-css: ${tokens.size} tokens, ${cssFiles.length} files, ` +
      `${renames.size} renamed, ${rewritten} references rewritten, ` +
      `${Date.now() - started}ms`,
  );
}

main();
