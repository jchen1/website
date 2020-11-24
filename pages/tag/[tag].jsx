import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import ErrorPage from "next/error";

import MainContainer from "../../components/containers/MainContainer";
import { ARCHIVE_FIELDS, getAllPosts } from "../../lib/blogs";

import { ArchiveItem } from "../archive";

const Title = styled.h1`
  text-align: left;
  width: min(45rem, 100%);
  margin-top: 0;
`;

export default function IndexPage(props) {
  const { posts, tag } = props;
  const router = useRouter();
  if (!router.isFallback && !posts) {
    return <ErrorPage statusCode={404} />;
  }

  const postMarkup = posts.map((post, idx) => <ArchiveItem {...post} />);

  return (
    <MainContainer>
      <Title>Posts tagged "{tag}"</Title>
      {postMarkup}
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const tag = params.tag;
  const posts = getAllPosts(ARCHIVE_FIELDS).filter(post =>
    post.tags.split(",").includes(tag)
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
