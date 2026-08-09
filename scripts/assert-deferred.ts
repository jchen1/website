import fs from "fs";
import path from "path";

// Guards the deferred-hydration setup in pages/_document.tsx against silent
// upgrades: a Next version that stops routing chunk tags through
// Head/NextScript getScripts()/getDynamicChunks() would quietly re-emit live
// `<script src>` tags and the deferral would be gone with no visible symptom.
// After a production build, every prerendered page must carry only inert
// `script[data-src]` placeholders for the Next runtime plus the inline
// activator. Exits nonzero when:
//   - any non-noModule script tag has a live src under /_next/static/chunks
//   - zero script[data-src] placeholders exist across all pages
//   - any page is missing the activator (identified by its __NEXT_HYDRATED
//     hydration poll)
//   - no prerendered HTML was found at all

const ACTIVATOR_MARKER = "__NEXT_HYDRATED";
const SCRIPT_TAG_RE = /<script\b[^>]*>/gi;
// `data-src` must not count as `src`, hence the lookbehind.
const LIVE_SRC_RE = /(?<!-)\bsrc\s*=\s*"([^"]*)"/i;
const PLACEHOLDER_RE = /\bdata-src\s*=\s*"\/_next\//i;

function walkHtml(dir: string, onFile: (f: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, onFile);
    else if (entry.name.endsWith(".html")) onFile(full);
  }
}

function main() {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const pagesDir = path.join(root, ".next", "server", "pages");
  const errors: string[] = [];
  let htmlFiles = 0;
  let placeholders = 0;

  walkHtml(pagesDir, file => {
    htmlFiles++;
    const rel = path.relative(root, file);
    const html = fs.readFileSync(file, "utf8");
    for (const tag of html.match(SCRIPT_TAG_RE) ?? []) {
      const src = LIVE_SRC_RE.exec(tag)?.[1];
      if (
        src?.startsWith("/_next/static/chunks") &&
        !/\bnomodule\b/i.test(tag)
      ) {
        errors.push(`${rel}: live chunk script ${tag}`);
      }
      if (PLACEHOLDER_RE.test(tag)) placeholders++;
    }
    if (!html.includes(ACTIVATOR_MARKER)) {
      errors.push(`${rel}: activator marker "${ACTIVATOR_MARKER}" missing`);
    }
  });

  if (htmlFiles === 0) {
    errors.push(`no prerendered HTML found under ${pagesDir}`);
  } else if (placeholders === 0) {
    errors.push("no script[data-src] placeholders found in any page");
  }

  if (errors.length > 0) {
    console.error("assert-deferred: FAIL — hydration deferral is broken:");
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log(
    `assert-deferred: OK — ${htmlFiles} pages, ${placeholders} inert ` +
      `placeholders, no live chunk scripts`,
  );
}

main();
