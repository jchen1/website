import Head from "next/head";
import React from "react";

import { MainContainer } from "../components/containers";
import { getAllPosts, markdownToHtml } from "../lib/blogs";
import BlogPost from "../components/BlogPost";

export default function Home({ allPosts }) {
  const posts = allPosts.map(post => (
    <BlogPost
      key={post.title}
      post={post}
      opts={{ readMore: true, setTitle: false }}
    ></BlogPost>
  ));

  return (
    <MainContainer>
      <Head>
        <title key="title">Jeff Chen</title>
      </Head>
      {posts}
    </MainContainer>
  );
}

export async function getStaticProps() {
  const allPosts = await Promise.all(
    getAllPosts(["title", "date", "slug", "author", "content"]).map(
      async post => ({
        ...post,
        content: await markdownToHtml(post.content || "", true),
      })
    )
  );

  return { props: { allPosts } };
}
