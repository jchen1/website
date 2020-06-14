import React from "react";
import { MainContainer } from "../../components/containers";
import { getPageBySlug, markdownToHtml } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

export default function jotaPrivacy({ page }) {
  return (
    <MainContainer>
      <BlogPost post={page} opts={{ showDate: false, noLink: true }}></BlogPost>
    </MainContainer>
  );
}

export async function getStaticProps() {
  const page = getPageBySlug("jota-privacy", ["title", "content"]);
  const content = await markdownToHtml(page.content || "");

  return {
    props: {
      page: {
        ...page,
        content,
      },
    },
  };
}
