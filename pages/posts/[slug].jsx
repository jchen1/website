import React from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

import {
  markdownToHtml,
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  POST_FIELDS,
  ARCHIVE_FIELDS,
} from "../../lib/blogs";
import { sizeImage } from "../../lib/util";

import BlogPost from "../../components/BlogPost";

export default function Post({ post, relatedPosts }) {
  const router = useRouter();
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <BlogPost
      post={post}
      opts={{ showScroll: true, preloadHero: true }}
      relatedPosts={relatedPosts}
    />
  );
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, POST_FIELDS);
  const content = await markdownToHtml(post.content || "");

  const heroImageSize = (function () {
    if (post.heroImage) {
      return sizeImage(post.heroImage, { basepath: "public" }) || {};
    }
    return {};
  })();

  const relatedPosts = getRelatedPosts(post, ARCHIVE_FIELDS);

  return {
    props: {
      post: {
        ...post,
        ...content,
        heroImageSize,
      },
      relatedPosts,
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
