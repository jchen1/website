import fs from "fs";
import { join } from "path";

import type { Metas } from "../types";

const dir = join(process.cwd(), "pages/projects/track");

export type TrackPage = Metas & { page: string };

// A page that exports `hidden` stays reachable but unlisted, e.g. the redirect
// left behind by a renamed slug.
interface PageExports {
  metas?: Metas;
  hidden?: boolean;
}

export function getAllPages(): TrackPage[] {
  return fs
    .readdirSync(dir)
    .filter(fn => fn !== "index.tsx")
    .map(fn => {
      // remove extension
      const page = fn.split(".")[0];
      const { metas, hidden } = require(
        `pages/projects/track/${page}`,
      ) as PageExports;
      if (!metas) {
        throw new Error(
          `File ${page} does not export required export \`metas\`!`,
        );
      }
      return { metas, hidden, page };
    })
    .filter(({ hidden }) => !hidden)
    .map(({ metas, page }) => ({ ...metas, page }))
    .sort((a, b) => a.page.localeCompare(b.page));
}
