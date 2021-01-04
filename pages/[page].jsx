import React from "react";

import {
  getAllPosts,
  markdownToHtml,
  POSTS_PER_PAGE,
  POST_FIELDS,
} from "../lib/blogs";
import { sizeImage } from "lib/util";

import BlogSnippet from "components/BlogSnippet";
import Pagination from "components/Pagination";

export default function IndexPage(props) {
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

export async function getStaticProps({ params }) {
  const page = parseInt(params.page) - 1;
  const start = POSTS_PER_PAGE * page;

  const allPosts = getAllPosts(POST_FIELDS);

  const posts = await Promise.all(
    allPosts.slice(start, start + POSTS_PER_PAGE).map(async (post, i) => {
      const {
        excerptHTML,
        postExcerptAnchor,
      } = await markdownToHtml(post.content || "", { eagerLoad: i === 0 });
      delete post.content;

      const heroImageSize = (function () {
        if (post.heroImage) {
          return sizeImage(post.heroImage, { basepath: "public" }) || {};
        }
        return {};
      })();

      return {
        ...post,
        excerptHTML,
        postExcerptAnchor,
        heroImageSize,
      };
    })
  );

  const numPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // const prev = page >= 0 && `/${page}`;
  const prev = page === -1 ? null : page === 0 ? "/" : `/${page}`;
  const next = page < numPages - 1 && `/${page + 2}`;

  return {
    props: {
      posts,
      next,
      prev,
    },
  };
}

export async function getStaticPaths() {
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
}
