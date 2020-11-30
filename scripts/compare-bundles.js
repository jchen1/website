const fs = require("fs");
const path = require("path");

const currentBundle = require("../.next/analyze/bundle.json");
const masterBundle = require("../.next/analyze/master/bundle/bundle.json");

const prefix = ".next";
const outdir = path.join(process.cwd(), prefix, "analyze");
const outfile = path.join(outdir, "bundle-comparison.txt");

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

const output = `# Bundle Size

| Route | Size (gzipped) |
| --- | --- |
${currentBundle
  .map(({ path, size }) => {
    const masterSize = masterBundle.find(x => x.path === path);
    const diffStr = masterSize ? formatBytes(size - masterSize) : "added";
    return `| \`${path}\` | ${formatBytes(size)} (${diffStr}) |`;
  })
  .join("\n")}

<!-- GH BOT -->`;

try {
  fs.mkdirSync(outdir);
} catch (e) {
  // may already exist
}

fs.writeFileSync(outfile, output);
