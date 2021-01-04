import React from "react";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";

export default function Projects({ page }) {
  return <BlogPost post={page} />;
}

export async function getStaticProps() {
  const page = getPageBySlug("projects", ["title", "content"]);
  const content = await markdownToHtml(page.content || "");

  return {
    props: {
      page: {
        ...page,
        ...content,
      },
    },
  };
}
