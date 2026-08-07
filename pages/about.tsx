import React from "react";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";
import ConvertKit from "components/ConvertKit";

export default function About({ page }) {
  return (
    <>
      <BlogPost post={page} />
      <ConvertKit />
    </>
  );
}

export async function getStaticProps() {
  const page = getPageBySlug("about", ["title", "content"]);
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
