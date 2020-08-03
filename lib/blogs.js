import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import remark from "remark";
import html from "remark-html";
import highlight from "remark-highlight.js";
import externalLinks from "remark-external-links";
import yaml from "js-yaml";
import excerpt from "remark-excerpt";

export async function markdownToHtml(markdown, excerptOnly = false) {
  const remarkInstance = remark();
  if (excerptOnly) {
    remarkInstance.use(excerpt);
  }
  const result = await remarkInstance
    .use(highlight)
    .use(externalLinks)
    .use(html)
    .process(markdown);
  return result.toString();
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

export function getPageSlugs() {
  return fs.readdirSync(pagesDirectory);
}

export function getPageBySlug(slug, fields = []) {
  return readFromSlug("pages", slug, fields);
}

export async function getProjects() {
  const projects = yaml.safeLoad(
    fs.readFileSync(join(process.cwd(), "data/projects.yml"))
  );
  return Promise.all(
    projects.map(async project => ({
      ...project,
      content: await markdownToHtml(project.content || ""),
    }))
  );
}
