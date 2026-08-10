import fs from "fs";
import path from "path";

// Guards the deferred-hydration setup in pages/_document.tsx against silent
// upgrades: a Next version that stops routing chunk tags through
// Head/NextScript getScripts()/getDynamicChunks() would quietly re-emit live
// `<script src>` tags and the deferral would be gone with no visible symptom.
//
// After a production build, every scan root is walked (.next/server/pages
// always; the exported out/ tree too with --export or STATIC_EXPORT). HTML
// documents split in two classes, discriminated by the __NEXT_DATA__ script
// only Next-rendered pages carry:
//   - Next-rendered pages must hold only inert `script[data-src]`
//     placeholders for the runtime plus the inline activator, and no script
//     preloads.
//   - anything else is a verbatim copy from public/ (resume.html, ...) that
//     never had placeholders or an activator; it is only scanned for live
//     Next chunk scripts and /_next JS preloads, which are wrong in any
//     document.
//
// Exits nonzero when:
//   - any non-noModule script tag has a live src under /_next/static
//     (chunks, _buildManifest.js, _ssgManifest.js) — checked in every file
//   - any preload/modulepreload link points at a JS asset under
//     /_next/static (any file), or is for a script at all (rendered pages) —
//     a surviving preload re-fetches the chunks up front even when the
//     script tags are inert
//   - any rendered page has zero script[data-src] placeholders
//   - any rendered page is missing the activator (identified by its
//     __NEXT_HYDRATED hydration poll)
//   - a required scan root is missing or holds no HTML at all
//   - a page the build manifests say was emitted as HTML was never scanned:
//     pages-manifest.json lists the statically optimized pages as .html
//     outputs, prerender-manifest.json lists every getStaticProps route
//     (whose HTML lands at .next/server/pages/<route>.html); with --export
//     each such route must also have been scanned under out/. A silently
//     missing page must fail the canary, not shrink the run.

const ACTIVATOR_MARKER = "__NEXT_HYDRATED";
const NEXT_DATA_MARKER = 'id="__NEXT_DATA__"';
const SCRIPT_TAG_RE = /<script\b[^>]*>/gi;
const LINK_TAG_RE = /<link\b[^>]*>/gi;
// `data-src` must not count as `src`, hence the lookbehind.
const LIVE_SRC_RE = /(?<!-)\bsrc\s*=\s*"([^"]*)"/i;
const PLACEHOLDER_RE = /\bdata-src\s*=\s*"\/_next\//i;
const PRELOAD_REL_RE = /\brel\s*=\s*"(?:module)?preload"/i;
const AS_SCRIPT_RE = /\bas\s*=\s*"script"/i;
const HREF_RE = /\bhref\s*=\s*"([^"]*)"/i;

function isNextJsAsset(url: string | undefined): boolean {
  if (!url) return false;
  const [pathname] = url.split("?");
  return pathname.startsWith("/_next/static/") && pathname.endsWith(".js");
}

function walkHtml(dir: string, onFile: (f: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, onFile);
    else if (entry.name.endsWith(".html")) onFile(full);
  }
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function main() {
  const args = process.argv.slice(2);
  const exportMode =
    args.includes("--export") || Boolean(process.env.STATIC_EXPORT);
  const rootArg = args.find(a => !a.startsWith("--"));
  const root = path.resolve(rootArg ?? process.cwd());
  const serverPagesDir = path.join(root, ".next", "server", "pages");
  const outDir = path.join(root, "out");
  const scanDirs = [serverPagesDir];
  if (exportMode) scanDirs.push(outDir);
  const errors: string[] = [];
  const scanned = new Set<string>();
  let rendered = 0;
  let copied = 0;
  let placeholders = 0;

  const checkFile = (file: string) => {
    scanned.add(file);
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, "utf8");
    const isNextDoc = html.includes(NEXT_DATA_MARKER);
    let pagePlaceholders = 0;
    for (const tag of html.match(SCRIPT_TAG_RE) ?? []) {
      const src = LIVE_SRC_RE.exec(tag)?.[1];
      if (isNextJsAsset(src) && !/\bnomodule\b/i.test(tag)) {
        errors.push(`${rel}: live chunk script ${tag}`);
      }
      if (PLACEHOLDER_RE.test(tag)) pagePlaceholders++;
    }
    for (const tag of html.match(LINK_TAG_RE) ?? []) {
      if (!PRELOAD_REL_RE.test(tag)) continue;
      if (isNextJsAsset(HREF_RE.exec(tag)?.[1])) {
        errors.push(`${rel}: Next chunk preload ${tag}`);
      } else if (isNextDoc && AS_SCRIPT_RE.test(tag)) {
        errors.push(`${rel}: script preload ${tag}`);
      }
    }
    if (!isNextDoc) {
      copied++;
      return;
    }
    rendered++;
    if (pagePlaceholders === 0) {
      errors.push(`${rel}: no script[data-src] placeholders`);
    }
    if (!html.includes(ACTIVATOR_MARKER)) {
      errors.push(`${rel}: activator marker "${ACTIVATOR_MARKER}" missing`);
    }
    placeholders += pagePlaceholders;
  };

  for (const dir of scanDirs) {
    const rel = path.relative(root, dir);
    if (!fs.existsSync(dir)) {
      errors.push(`required scan root missing: ${rel}`);
      continue;
    }
    let found = 0;
    walkHtml(dir, f => {
      found++;
      checkFile(f);
    });
    if (found === 0) errors.push(`required scan root holds no HTML: ${rel}`);
  }

  // Coverage: collect every route the build wrote as HTML and require that
  // its file(s) were among the scanned set.
  const htmlRoutes = new Set<string>();
  const pagesManifest = path.join(
    root,
    ".next",
    "server",
    "pages-manifest.json",
  );
  if (fs.existsSync(pagesManifest)) {
    const manifest = readJson<Record<string, string>>(pagesManifest);
    for (const [route, output] of Object.entries(manifest)) {
      if (output.endsWith(".html")) htmlRoutes.add(route);
    }
  } else {
    errors.push("missing .next/server/pages-manifest.json");
  }
  const prerenderManifest = path.join(root, ".next", "prerender-manifest.json");
  if (fs.existsSync(prerenderManifest)) {
    const manifest = readJson<{ routes: Record<string, unknown> }>(
      prerenderManifest,
    );
    for (const route of Object.keys(manifest.routes)) htmlRoutes.add(route);
  } else {
    errors.push("missing .next/prerender-manifest.json");
  }

  for (const route of htmlRoutes) {
    const name = (route === "/" ? "/index" : route).slice(1);
    const built = path.join(serverPagesDir, `${name}.html`);
    if (!scanned.has(built)) {
      errors.push(
        `${route}: built page ${path.relative(root, built)} was never scanned`,
      );
    }
    if (!exportMode) continue;
    // trailingSlash exports /x as out/x/index.html, but / and 404 land flat
    const candidates = [
      path.join(outDir, `${name}.html`),
      path.join(outDir, name, "index.html"),
    ];
    if (!candidates.some(c => scanned.has(c))) {
      errors.push(`${route}: no exported page for it was scanned under out/`);
    }
  }

  if (errors.length > 0) {
    console.error("assert-deferred: FAIL — hydration deferral is broken:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(
    `assert-deferred: OK — ${rendered} rendered pages (${htmlRoutes.size} ` +
      `manifest routes covered, ${copied} public copies skipped), ` +
      `${placeholders} inert placeholders, no live chunk scripts or script ` +
      `preloads`,
  );
}

main();
