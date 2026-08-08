import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";

import {
  getAllPosts,
  markdownToHtml,
  POSTS_PER_PAGE,
  POST_FIELDS,
} from "../lib/blogs";

import BlogSnippet from "components/BlogSnippet";
import Pagination from "components/Pagination";
import { sizeImage } from "../lib/util/server";

import type { MarkdownItem } from "../lib/types";

// Dimensions of a post's hero image, or `{}` when the post has no hero image
// or its dimensions could not be read.
export type HeroImageSize = Partial<NonNullable<ReturnType<typeof sizeImage>>>;

// A post with its excerpt rendered, as listed on an index page.
export interface SnippetPost extends Omit<
  MarkdownItem,
  "content" | "tags" | "draft"
> {
  excerptHTML: string;
  postExcerptAnchor: string;
  heroImageSize: HeroImageSize;
}

export interface IndexPageProps {
  posts: SnippetPost[];
  next: string | false;
  prev: string | null;
}

export default function IndexPage(props: IndexPageProps) {
  const { posts, next, prev } = props;

  const postMarkup = posts.map((post, idx) => (
    <BlogSnippet
      key={post.title}
      post={post}
      opts={{ preloadHero: idx === 0 }}
    />
  ));

  return (
    <>
      {postMarkup}
      <Pagination next={next} prev={prev} />
    </>
  );
}

export const getStaticProps: GetStaticProps<
  IndexPageProps,
  { page: string }
> = async ({ params }) => {
  const page = parseInt(params!.page) - 1;
  const start = POSTS_PER_PAGE * page;

  const allPosts = getAllPosts(POST_FIELDS);

  const posts = await Promise.all(
    allPosts.slice(start, start + POSTS_PER_PAGE).map(async (post, i) => {
      const { excerptHTML, postExcerptAnchor } = await markdownToHtml(
        post.content || "",
        { eagerLoad: i === 0 },
      );
      const {
        content: _content,
        tags: _tags,
        draft: _draft,
        ...postFields
      } = post;

      const heroImageSize = (function (): HeroImageSize {
        if (post.heroImage) {
          return sizeImage(post.heroImage, { basepath: "public" }) || {};
        }
        return {};
      })();

      return {
        ...postFields,
        excerptHTML,
        postExcerptAnchor,
        heroImageSize,
      };
    }),
  );

  const numPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  const prev = (function () {
    switch (page) {
      case 0:
        return null;
      case 1:
        return "/";
      default:
        return `/${page}`;
    }
  })();
  const next = page < numPages - 1 && `/${page + 2}`;

  return {
    props: {
      posts,
      next,
      prev,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts(["slug"]);
  const numPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  return {
    paths: [...Array(numPages).keys()].map(page => {
      return {
        params: { page: `${page + 1}` },
      };
    }),
    fallback: false,
  };
};
