import React from "react";
import { MainContainer } from "../components/containers";
import Head from "next/head";
import { getPageBySlug, markdownToHtml } from "../lib/blogs";
import BlogPost from "../components/BlogPost";

export default function About({ page }) {
  return (
    <MainContainer>
      <Head>
        <title key="title">About</title>
      </Head>
      <BlogPost post={page} opts={{ showDate: false }}></BlogPost>
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
        content,
      },
    },
  };
}
