import React from "react";
import styled from "styled-components";
import Link from "next/link";

import MainContainer from "../components/containers/MainContainer";
import { ARCHIVE_FIELDS, getAllPosts } from "../lib/blogs";

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  width: min(100%, 45rem);
  margin: 0.5rem 0;
`;

const Title = styled.h1`
  width: min(45rem, 100%);
  text-align: left;

  margin-top: 0;
`;

const Date = styled.p`
  margin: 0;
`;

const Item = styled.h3`
  margin: 0;
`;

export function ArchiveItem({ title, date, slug }) {
  return (
    <ItemWrapper>
      <Item>
        <Link href={`/posts/${slug}`} passHref prefetch={false}>
          {title}
        </Link>
      </Item>
      <Date>{date}</Date>
    </ItemWrapper>
  );
}

export default function Archive(props) {
  const { posts } = props;

  const postMarkup = posts.map(post => <ArchiveItem {...post} />);

  return (
    <MainContainer>
      <Title>Post Archive</Title>
      {postMarkup}
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const posts = getAllPosts(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
    },
  };
}
