import fs from "fs";
import { join } from "path";

import type { Metas } from "../types";

const dir = join(process.cwd(), "pages/projects/track");

export type TrackPage = Metas & { page: string };

export function getAllPages(): TrackPage[] {
  return fs
    .readdirSync(dir)
    .filter(fn => fn !== "index.jsx")
    .map(fn => {
      // remove extension
      const page = fn.split(".")[0];
      const { metas } = require(`pages/projects/track/${page}`) as {
        metas?: Metas;
      };
      if (!metas) {
        throw new Error(
          `File ${page} does not export required export \`metas\`!`,
        );
      }
      return { ...metas, page };
    })
    .sort((a, b) => a.page.localeCompare(b.page));
}
