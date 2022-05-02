import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import highlight from "remark-highlight.js";
import gfm from "remark-gfm";
import externalLinks from "remark-external-links";
import slug from "remark-slug";
import excerpt from "remark-excerpt";
import smartypants from "@silvenon/remark-smartypants";
import strip from "strip-markdown";

import {
  trackingLinks,
  optimizeImages,
  addCaptionsToImages,
  anchorPostExcerpt,
  removeImages,
  setHighlightLang,
} from "./remarkPlugins";

export const POST_FIELDS = [
  "title",
  "date",
  "slug",
  "content",
  "heroImage",
  "ogImage",
  "tags",
];

export const ARCHIVE_FIELDS = ["title", "date", "slug", "tags"];

export const POSTS_PER_PAGE = 5;

export async function markdownToHtml(markdown, opts) {
  markdown = markdown.replace(/\\\$/g, "$");

  const remarkInstance = remark();
  const excerptInstance = remark().use(excerpt);

  const [contentHTML, excerptHTML] = [remarkInstance, excerptInstance].map(
    instance =>
      instance
        .use(gfm)
        .use(smartypants)
        .use(slug)
        .use(highlight)
        .use(setHighlightLang)
        .use(externalLinks)
        .use(trackingLinks)
        .use(optimizeImages, { basepath: "public", ...opts })
        .use(addCaptionsToImages)
        .use(anchorPostExcerpt)
        // Safe because this only looks at trusted
        .use(html, { sanitize: false })
        .process(markdown)
  );

  const excerptText = remark()
    .use(excerpt)
    .use(removeImages)
    .use(strip)
    .process(markdown);
  const postExcerptAnchor = remark()
    .use(gfm)
    .use(slug)
    .use(anchorPostExcerpt, { returnAnchor: true })
    .process(markdown);

  return {
    contentHTML: (await contentHTML).toString(),
    excerptHTML: (await excerptHTML).toString(),
    excerpt: (await excerptText).toString().trim(),
    postExcerptAnchor: (await postExcerptAnchor).toString(),
  };
}

const postsDirectory = join(process.cwd(), "markdown/posts");
const pagesDirectory = join(process.cwd(), "markdown/pages");

function readFromSlug(type, slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(
    type === "posts" ? postsDirectory : pagesDirectory,
    `${realSlug}.md`
  );
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const items = {};

  // Ensure only the minimal needed data is exposed
  fields.forEach(field => {
    if (field === "slug") {
      items[field] = realSlug;
    }
    if (field === "content") {
      items[field] = content;
    }

    if (data[field]) {
      items[field] = data[field];
    }
  });

  return items;
}

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug, fields = []) {
  return readFromSlug("posts", slug, fields);
}

export function getAllPosts(fields = []) {
  const slugs = getPostSlugs();
  const posts = slugs
    .map(slug => getPostBySlug(slug, fields))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? "-1" : "1"));
  return posts;
}

export function getPostsByTag(tag, fields = []) {
  return getAllPosts(
    fields.includes("tags") ? fields : fields.concat("tags")
  ).filter(post =>
    post.tags
      .split(",")
      .map(x => x.trim())
      .includes(tag)
  );
}

function isMonthOrYear(tag) {
  return [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "2019",
    "2020",
    "2021",
  ].includes(tag.toLowerCase());
}

export function getRelatedPosts(post, fields = []) {
  // non month/year tags come first!
  const tags = post.tags.split(",").sort((a, b) => {
    if (isMonthOrYear(a) && !isMonthOrYear(b)) {
      return 1;
    } else if (!isMonthOrYear(a) && isMonthOrYear(b)) {
      return -1;
    } else {
      return b.localeCompare(a);
    }
  });

  return tags
    .flatMap(tag => getPostsByTag(tag, fields))
    .concat(getAllPosts(fields))
    .filter(
      (p, i, a) =>
        post.slug !== p.slug && a.findIndex(e => p.slug === e.slug) === i
    )
    .slice(0, 3);
}

export function getPageSlugs() {
  return fs.readdirSync(pagesDirectory);
}

export function getPageBySlug(slug, fields = []) {
  return readFromSlug("pages", slug, fields);
}
