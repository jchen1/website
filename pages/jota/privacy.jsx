import React from "react";
import { getPageBySlug, markdownToHtml } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

export default function jotaPrivacy({ page }) {
  return <BlogPost post={page} opts={{ showDate: false, noLink: true }} />;
}

export async function getStaticProps() {
  const page = getPageBySlug("jota-privacy", ["title", "content"]);
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
