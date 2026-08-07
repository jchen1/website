import fs from "fs";
import path from "path";
import zlib from "zlib";

// The manifest is a build artifact outside the TS project, so it is pulled in
// with require() and typed by assertion rather than imported.
interface BuildManifest {
  pages: Record<string, string[]>;
}

const bundle = require("../.next/build-manifest.json") as BuildManifest;

const prefix = ".next";
const outdir = path.join(process.cwd(), prefix, "analyze");
const outfileJSON = path.join(outdir, "bundle.json");

const pageSizes = Object.keys(bundle.pages).map(p => {
  const files = bundle.pages[p];
  const size = files
    .map(filename => {
      const fn = path.join(process.cwd(), prefix, filename);
      const bytes = fs.readFileSync(fn);
      const gzipped = zlib.gzipSync(bytes);
      return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

  return { path: p, size };
});

try {
  fs.mkdirSync(outdir);
} catch {
  // may already exist
}

fs.writeFileSync(outfileJSON, JSON.stringify(pageSizes, null, 2));
