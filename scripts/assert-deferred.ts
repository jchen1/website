import fs from "fs";
import path from "path";

// Guards the deferred-hydration setup in pages/_document.tsx against silent
// upgrades: a Next version that stops routing chunk tags through
// Head/NextScript getScripts()/getDynamicChunks() would quietly re-emit live
// `<script src>` tags and the deferral would be gone with no visible symptom.
// After a production build, every prerendered page must carry only inert
// `script[data-src]` placeholders for the Next runtime plus the inline
// activator. Exits nonzero when:
//   - any non-noModule script tag has a live src under /_next/static
//     (chunks, _buildManifest.js, _ssgManifest.js)
//   - any preload/modulepreload link is for a script or points at a JS asset
//     under /_next/static — a surviving preload re-fetches the chunks up
//     front even when the script tags are inert
//   - any page has zero script[data-src] placeholders
//   - any page is missing the activator (identified by its __NEXT_HYDRATED
//     hydration poll)
//   - no prerendered HTML was found at all
// With --export (or STATIC_EXPORT set) the exported out/ tree is scanned in
// addition to .next/server/pages.

const ACTIVATOR_MARKER = "__NEXT_HYDRATED";
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
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, onFile);
    else if (entry.name.endsWith(".html")) onFile(full);
  }
}

function main() {
  const args = process.argv.slice(2);
  const exportMode =
    args.includes("--export") || Boolean(process.env.STATIC_EXPORT);
  const rootArg = args.find(a => !a.startsWith("--"));
  const root = path.resolve(rootArg ?? process.cwd());
  const scanDirs = [path.join(root, ".next", "server", "pages")];
  if (exportMode) scanDirs.push(path.join(root, "out"));
  const errors: string[] = [];
  let htmlFiles = 0;
  let placeholders = 0;

  const checkFile = (file: string) => {
    htmlFiles++;
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, "utf8");
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
      if (AS_SCRIPT_RE.test(tag) || isNextJsAsset(HREF_RE.exec(tag)?.[1])) {
        errors.push(`${rel}: script preload ${tag}`);
      }
    }
    if (pagePlaceholders === 0) {
      errors.push(`${rel}: no script[data-src] placeholders`);
    }
    if (!html.includes(ACTIVATOR_MARKER)) {
      errors.push(`${rel}: activator marker "${ACTIVATOR_MARKER}" missing`);
    }
    placeholders += pagePlaceholders;
  };

  for (const dir of scanDirs) walkHtml(dir, checkFile);

  if (htmlFiles === 0) {
    errors.push(`no prerendered HTML found under ${scanDirs.join(", ")}`);
  }

  if (errors.length > 0) {
    console.error("assert-deferred: FAIL — hydration deferral is broken:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(
    `assert-deferred: OK — ${htmlFiles} pages, ${placeholders} inert ` +
      `placeholders, no live chunk scripts or script preloads`,
  );
}

main();
