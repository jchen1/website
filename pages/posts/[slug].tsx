import React from "react";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import type { GetStaticPaths, GetStaticProps } from "next";

import {
  markdownToHtml,
  getPostBySlug,
  getAllPosts,
  getRelatedPosts,
  POST_FIELDS,
  ARCHIVE_FIELDS,
} from "lib/blogs";

import BlogPost from "components/BlogPost";
import { sizeImage } from "../../lib/util/server";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

// Dimensions of the post's hero image, or `{}` when the post has no hero
// image or its dimensions could not be read.
type HeroImageSize = Partial<NonNullable<ReturnType<typeof sizeImage>>>;

interface PostProps {
  post: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt"> & {
      heroImageSize: HeroImageSize;
    };
  relatedPosts: Pick<MarkdownItem, "title" | "slug">[];
}

export default function Post({ post, relatedPosts }: PostProps) {
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

export const getStaticProps: GetStaticProps<
  PostProps,
  { slug: string }
> = async ({ params }) => {
  const post = getPostBySlug(params!.slug, POST_FIELDS);
  const { contentHTML, excerpt } = await markdownToHtml(post.content || "");

  const heroImageSize = (function (): HeroImageSize {
    if (post.heroImage) {
      return sizeImage(post.heroImage, { basepath: "public" }) || {};
    }
    return {};
  })();

  const relatedPosts = getRelatedPosts(post, ARCHIVE_FIELDS).map(
    ({ date: _date, tags: _tags, draft: _draft, ...related }) => related,
  );
  const { content: _content, ...postFields } = post;

  return {
    props: {
      post: {
        ...postFields,
        contentHTML,
        excerpt,
        heroImageSize,
      },
      relatedPosts,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
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
};
