import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";

import MainContainer from "../../components/containers/MainContainer";
import { getAllPosts, markdownToHtml, POST_FIELDS } from "../../lib/blogs";
import { sizeImage } from "../../lib/util";

import BlogSnippet from "../../components/BlogSnippet";
import ErrorPage from "next/error";

const Title = styled.h3`
  text-align: left;
  width: min(45rem, 100%);
  margin: 0;
`;

export default function IndexPage(props) {
  const { posts, tag } = props;
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
    <MainContainer>
      <Title>Posts tagged "{tag}"</Title>
      <>{postMarkup}</>
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const posts = await Promise.all(
    getAllPosts(POST_FIELDS)
      .filter(post => post.tags.split(",").includes(tag))
      .map(async post => {
        const content = await markdownToHtml(post.content || "");
        delete content.contentHTML;
        delete post.content;

        const heroImageSize = (function () {
          if (post.heroImage) {
            return sizeImage(post.heroImage, { basepath: "public" }) || {};
          }
          return {};
        })();
        return {
          ...post,
          ...content,
          heroImageSize,
        };
      })
  );

  return {
    props: {
      posts,
      tag,
    },
  };
}

export async function getStaticPaths() {
  const tags = [
    ...new Set(
      getAllPosts(["tags"])
        .map(p => p.tags)
        .map(taglist => taglist.split(","))
        .flat()
    ),
  ];
  return {
    paths: tags.map(tag => {
      return {
        params: { tag },
      };
    }),
    fallback: false,
  };
}
