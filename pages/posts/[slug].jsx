import React from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

import { markdownToHtml, getPostBySlug, getAllPosts } from "../../lib/blogs";
import { MainContainer } from "../../components/containers";

import BlogPost from "../../components/BlogPost";

export default function Post({ post }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <MainContainer>
      <BlogPost post={post} opts={{ showScroll: true }}></BlogPost>
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, [
    "title",
    "date",
    "slug",
    "author",
    "content",
    "heroImage",
  ]);
  const content = await markdownToHtml(post.content || "");

  return {
    props: {
      post: {
        ...post,
        ...content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map(post => {
      return {
        params: {
          slug: post.slug,
        },
      };
    }),
    fallback: false,
  };
}
