import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

import { MainContainer } from "../components/containers";
import { getAllPosts, markdownToHtml, POSTS_PER_PAGE } from "../lib/blogs";
import BlogPost from "../components/BlogPost";
import ErrorPage from "next/error";
import Pagination from "../components/Pagination";

export default function IndexPage(props) {
  const { posts, pages } = props;
  const router = useRouter();
  if (!router.isFallback && !posts) {
    return <ErrorPage statusCode={404} />;
  }

  const postMarkup = posts.map(post => (
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
      {postMarkup}
      <Pagination pages={pages} />
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const page = parseInt(params.page);
  const start = POSTS_PER_PAGE * page;

  const allPosts = await Promise.all(
    getAllPosts(["title", "date", "slug", "author", "content"]).map(
      async post => ({
        ...post,
        content: await markdownToHtml(post.content || "", true),
      })
    )
  );

  const posts = allPosts.slice(start, start + POSTS_PER_PAGE);
  const numPages = 1 + Math.floor(allPosts.length / POSTS_PER_PAGE);
  const pages = [...Array(numPages).keys()].map(p => ({
    link: p === 0 ? "/" : `/${p}`, // special-case page 0 to homepage
    isCurrent: page === p,
    title: `${p}`,
  }));

  return {
    props: {
      posts,
      pages,
      numPages,
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);
  const numPages = 1 + Math.floor(posts.length / POSTS_PER_PAGE);
  return {
    paths: [...Array(numPages).keys()].map(page => {
      return {
        params: { page: `${page}` },
      };
    }),
    fallback: false,
  };
}
