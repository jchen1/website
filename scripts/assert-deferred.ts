import fs from "fs";
import path from "path";

// Guards the deferred-hydration setup in pages/_document.tsx against silent
// upgrades: a Next version that stops routing chunk tags through
// Head/NextScript getScripts()/getDynamicChunks() would quietly re-emit live
// `<script src>` tags (or preloads) and the deferral would be gone with no
// visible symptom. Every Next-rendered page — discriminated by the
// __NEXT_DATA__ script that verbatim public/ copies like resume.html lack —
// must hold inert `script[data-src]` placeholders, the inline activator, and
// no live fetch of a /_next JS asset via script src or preload/modulepreload.

const ACTIVATOR_MARKER = "__NEXT_HYDRATED";
const NEXT_DATA_MARKER = 'id="__NEXT_DATA__"';
const SCRIPT_TAG_RE = /<script\b[^>]*>/gi;
const LINK_TAG_RE = /<link\b[^>]*>/gi;
// `data-src` must not count as `src`, hence the lookbehind.
const LIVE_SRC_RE = /(?<!-)\bsrc\s*=\s*"([^"]*)"/i;
const PLACEHOLDER_RE = /\bdata-src\s*=\s*"\/_next\//i;
const PRELOAD_RE = /\brel\s*=\s*"(?:module)?preload"/i;
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

function main() {
  const args = process.argv.slice(2);
  const exportMode =
    args.includes("--export") || Boolean(process.env.STATIC_EXPORT);
  const root = path.resolve(args.find(a => !a.startsWith("--")) ?? ".");
  const scanDirs = [path.join(root, ".next", "server", "pages")];
  if (exportMode) scanDirs.push(path.join(root, "out"));
  const errors: string[] = [];
  let rendered = 0;
  let placeholders = 0;

  for (const dir of scanDirs) {
    walkHtml(dir, file => {
      const rel = path.relative(root, file);
      const html = fs.readFileSync(file, "utf8");
      let pagePlaceholders = 0;
      for (const tag of html.match(SCRIPT_TAG_RE) ?? []) {
        if (isNextJsAsset(LIVE_SRC_RE.exec(tag)?.[1]) && !/\bnomodule\b/i.test(tag)) {
          errors.push(`${rel}: live chunk script ${tag}`);
        }
        if (PLACEHOLDER_RE.test(tag)) pagePlaceholders++;
      }
      for (const tag of html.match(LINK_TAG_RE) ?? []) {
        if (PRELOAD_RE.test(tag) && isNextJsAsset(HREF_RE.exec(tag)?.[1])) {
          errors.push(`${rel}: Next chunk preload ${tag}`);
        }
      }
      if (!html.includes(NEXT_DATA_MARKER)) return;
      rendered++;
      placeholders += pagePlaceholders;
      if (pagePlaceholders === 0) {
        errors.push(`${rel}: no script[data-src] placeholders`);
      }
      if (!html.includes(ACTIVATOR_MARKER)) {
        errors.push(`${rel}: activator marker "${ACTIVATOR_MARKER}" missing`);
      }
    });
  }
  if (rendered === 0) errors.push("no Next-rendered HTML pages were scanned");

  if (errors.length > 0) {
    console.error("assert-deferred: FAIL — hydration deferral is broken:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(
    `assert-deferred: OK — ${rendered} rendered pages, ${placeholders} inert ` +
      `placeholders, no live chunk scripts or preloads`,
  );
}

main();
