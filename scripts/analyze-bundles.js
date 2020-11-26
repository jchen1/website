const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const bundle = require("../.next/build-manifest.json");

const prefix = ".next";
const outdir = path.join(process.cwd(), prefix, "analyze");
const outfile = path.join(outdir, "bundle.txt");

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const pageSizes = Object.keys(bundle.pages).map(p => {
    const files = bundle.pages[p];
    const size = files.map(filename => {
        const fn = path.join(process.cwd(), prefix, filename);
        const bytes = fs.readFileSync(fn);
        const gzipped = zlib.gzipSync(bytes);
        return gzipped.byteLength;
    })
    .reduce((s, b) => s + b, 0);

    return { path: p, size };
});

const output =
`# Bundle Size

| Route | Size (gzipped) |
| --- | --- |
${pageSizes.map(({ path, size }) => `| \`${path}\` | ${formatBytes(size)} |`).join("\n")}

<!-- GH BOT -->`;

try {
    fs.mkdirSync(outdir);
} catch (e) {
    // may already exist
}
fs.writeFileSync(outfile, output);