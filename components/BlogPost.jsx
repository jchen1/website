import React from "react";
import moment from "moment";
import styled from "styled-components";
import Link from "next/link";
import Head from "next/head";

import { GRAY } from "../lib/constants";
import { BlogContainer } from "../components/containers";

const ReadMoreLink = styled.a`
  font-size: 15px;
`;

const Date = styled.em`
  color: ${GRAY};
`;

function ReadMore({ post }) {
  return (
    <Link key={post.slug} href="/posts/[slug]" as={`/posts/${post.slug}`}>
      <ReadMoreLink>Read More</ReadMoreLink>
    </Link>
  );
}

function Title({ headingLevel, title, slug, homepage, noLink }) {
  const Heading = `h${headingLevel || 1}`;

  if (noLink) {
    return <Heading>{title}</Heading>;
  }

  if (homepage) {
    return (
      <Heading>
        <a href={homepage} target="_blank">
          {title}
        </a>
      </Heading>
    );
  }

  return (
    <Heading>
      <Link key={slug} href="/posts/[slug]" as={`/posts/${slug}`}>
        <a>{title}</a>
      </Link>
    </Heading>
  );
}

export default function BlogPost({ post, opts = {} }) {
  const { title, homepage, date, preimage, slug, author, content } = post;
  const { noLink, readMore, showDate, headingLevel, setTitle } = opts;
  const dateStr = moment(date).format("MMMM Do, YYYY");

  return (
    <BlogContainer>
      {setTitle !== false ? (
        <Head>
          <title key="title">{title}</title>
        </Head>
      ) : (
        ""
      )}
      <Title
        headingLevel={headingLevel}
        title={title}
        slug={slug}
        homepage={homepage}
        noLink={noLink}
      />
      {preimage ? <img src={`/images/${preimage}`} /> : ""}
      {showDate !== false ? <Date>{dateStr}</Date> : ""}
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {readMore ? <ReadMore post={post} /> : ""}
    </BlogContainer>
  );
}
