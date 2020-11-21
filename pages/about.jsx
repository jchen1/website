import React from "react";
import MainContainer from "../components/containers/MainContainer";
import { getPageBySlug, markdownToHtml } from "../lib/blogs";
import BlogPost from "../components/BlogPost";

export default function About({ page }) {
  return (
    <MainContainer>
      <BlogPost post={page} opts={{ showDate: false, noLink: true }}></BlogPost>
    </MainContainer>
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
