import React from "react";
import { useRouter } from "next/router";

import {
  getAllPosts,
  markdownToHtml,
  POSTS_PER_PAGE,
  POST_FIELDS,
} from "../lib/blogs";
import { sizeImage } from "../lib/util";

import BlogSnippet from "../components/BlogSnippet";
import ErrorPage from "next/error";
import Pagination from "../components/Pagination";

export default function IndexPage(props) {
  const { posts, pages } = props;
  const router = useRouter();
  if (!router.isFallback && !posts) {
    return <ErrorPage statusCode={404} />;
  }

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
      <Pagination pages={pages} />
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

  const numPages = 1 + Math.floor(allPosts.length / POSTS_PER_PAGE);
  const pages = [...Array(numPages).keys()].map(p => ({
    link: p === 0 ? "/" : `/${p + 1}`, // special-case page 0 to homepage
    isCurrent: page === p,
    title: `${p + 1}`,
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
        params: { page: `${page + 1}` },
      };
    }),
    fallback: false,
  };
}
