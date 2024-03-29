import fs from "fs";
import globby from "globby";
import matter from "gray-matter";
import rss from "rss";
import { markdownToHtml } from "../lib/blogs";

// copied from lib/constants
const BASE_URL = "https://jeffchen.dev";
const SITE_TITLE = "Jeff Chen";

function generateSitemap({ posts, pages }) {
  const prologue = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  const blogItems = posts.map(
    post => `  <url><loc>${BASE_URL}/posts/${post.slug}</loc></url>`
  );

  const pageItems = pages.map(
    page => `  <url><loc>${BASE_URL}/${page}</loc></url>`
  );

  const epilogue = `</urlset>`;
  const sitemap = [prologue].concat(blogItems, pageItems, epilogue);

  return sitemap.join("\n");
}

function generateRssFeed(posts) {
  const rssFeed = new rss({
    title: SITE_TITLE,
    site_url: BASE_URL,
  });

  posts.forEach(post => {
    rssFeed.item({
      title: post.title,
      date: post.date,
      author: post.author,
      url: `${BASE_URL}/posts/${post.slug}`,
      guid: `/posts/${post.slug}`,
      description: post.excerpt,
    });
  });

  return rssFeed.xml({ indent: true });
}

(async function () {
  const posts = await Promise.all(
    (
      await globby(["markdown/posts/*.md"])
    ).map(async page => {
      const slug = page.replace(/\.md$/, "").replace(/^markdown\/posts\//, "");
      const contents = fs.readFileSync(page);

      const { data, content } = matter(contents);
      const { excerpt } = await markdownToHtml(content);

      // console.log(content, excerpt);

      return {
        slug,
        excerpt,
        ...data,
      };
    })
  );

  // ignore prefixed & dynamic pages
  const pages = (await globby(["pages/*.jsx"]))
    .map(page => page.replace(/\.jsx$/, ""))
    .map(page => page.replace(/^pages\//, ""))
    .filter(page => !/^[_\[]/.test(page));

  fs.writeFileSync("public/rss-feed.xml", generateRssFeed(posts));
  fs.writeFileSync("public/sitemap.xml", generateSitemap({ posts, pages }));
})();
