import fs from "fs";
import { getAllPosts, getAllMeetReports } from "../lib/blogs";

import type {
  SearchIndex,
  SearchIndexGroup,
  SearchIndexItem,
} from "../lib/searchIndex";
import type { MarkdownItem } from "../lib/types";

const PAGES: SearchIndexItem[] = [
  { title: "About", route: "/about/", group: "Pages" },
  { title: "Projects", route: "/projects/", group: "Pages" },
  { title: "Archive", route: "/archive/", group: "Pages" },
  { title: "Meet Reports", route: "/meet-reports/", group: "Pages" },
  { title: "Impact", route: "/impact/", group: "Pages" },
  { title: "Metrics", route: "/metrics/", group: "Pages" },
  { title: "JOTA", route: "/jota/", group: "Pages" },
  { title: "Track Utilities", route: "/projects/track/", group: "Pages" },
  {
    title: "Wind Correction Calculator",
    route: "/projects/track/wind-correction/",
    group: "Pages",
  },
  {
    title: "200m Lane Draw Converter",
    route: "/projects/track/200m-lane-draw/",
    group: "Pages",
  },
  {
    title: "World Athletics Points Calculator",
    route: "/projects/track/points-calculator/",
    group: "Pages",
  },
  {
    title: "100m Predictor",
    route: "/projects/track/100m-predictor/",
    group: "Pages",
  },
];

function toItem(
  item: MarkdownItem,
  group: SearchIndexGroup,
  routePrefix: string,
): SearchIndexItem {
  const { title, slug, date } = item;
  if (!title || !slug || !date) {
    throw new Error(
      `Missing frontmatter for ${group} item: ${JSON.stringify(item)}`,
    );
  }
  return { title, route: `${routePrefix}${slug}/`, group, date };
}

(function () {
  const fields = ["title", "date", "slug"];

  const posts = getAllPosts(fields).map(post =>
    toItem(post, "Posts", "/posts/"),
  );
  const meetReports = getAllMeetReports(fields).map(report =>
    toItem(report, "Meet reports", "/meet-reports/"),
  );

  const index: SearchIndex = {
    v: 1,
    items: posts.concat(PAGES, meetReports),
  };

  fs.writeFileSync("public/search-index.json", JSON.stringify(index));
})();
