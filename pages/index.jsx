import Head from "next/head";
import React from "react";
import styled from "styled-components";

import Header from "../components/Header";
import {
  RootContainer,
  MainContainer,
  TitleContainer,
} from "../components/containers";
import { getAllPosts, markdownToHtml } from "../lib/blogs";
import Link from "next/link";
import BlogPost from "../components/BlogPost";

export default function Home({ allPosts }) {
  const posts = allPosts.map(post => (
    <BlogPost key={post.title} post={post} opts={{ readMore: true }}></BlogPost>
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
