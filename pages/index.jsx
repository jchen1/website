import Head from "next/head";
import React from "react";

import Header from "../components/Header";
import {
  RootContainer,
  MainContainer,
  TitleContainer,
} from "../components/containers";
import { getAllPosts } from "../lib/blogs";
import BlogPost from "../components/BlogPost";
import Link from "next/link";

export default function Home({ allPosts }) {
  return (
    <RootContainer>
      <Head>
        <title key="title">Jeff Chen</title>
      </Head>

      <Header />

      <MainContainer>
        <TitleContainer>
          <h1>Metrics</h1>
        </TitleContainer>
        {allPosts.map(post => (
          <Link key={post.slug} href="/posts/[slug]" as={`/posts/${post.slug}`}>
            <a>{post.title}</a>
          </Link>
        ))}
      </MainContainer>
    </RootContainer>
  );
}

export async function getStaticProps() {
  const allPosts = getAllPosts(["title", "date", "slug", "author", "content"]);

  return { props: { allPosts } };
}
