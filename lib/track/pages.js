import fs from "fs";
import { join } from "path";

const dir = join(process.cwd(), "pages/projects/track");

export function getAllPages() {
  const pages = fs
    .readdirSync(dir)
    .filter(fn => fn !== "index.jsx")
    .map(fn => {
      // remove extension
      const page = fn.split(".")[0];
      const { metas } = require(`pages/projects/track/${page}`);
      if (!metas) {
        throw new Error(
          `File ${page} does not export required export \`metas\`!`
        );
      }
      return { ...metas, page };
    })
    .sort((a, b) => a.page.localeCompare(b.page));

  return pages;
}
