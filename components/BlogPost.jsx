import React from "react";
import moment from "moment";
import styled from "styled-components";
import Link from "next/link";

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

export default function BlogPost({ post, opts = {} }) {
  const { title, homepage, date, preimage, slug, author, content } = post;
  const { readMore, showDate, headingLevel } = opts;
  const dateStr = moment(date).format("MMMM Do, YYYY");
  const Heading = `h${headingLevel || 1}`;

  const titleLink = !homepage ? (
    <Link key={post.slug} href="/posts/[slug]" as={`/posts/${post.slug}`}>
      <Heading>
        <a>{title}</a>
      </Heading>
    </Link>
  ) : (
    <Heading>
      <a href={homepage} target="_blank">
        {title}
      </a>
    </Heading>
  );

  return (
    <BlogContainer>
      {titleLink}
      {preimage ? <img src={`/images/${preimage}`} /> : ""}
      {showDate !== false ? <Date>{dateStr}</Date> : ""}
      <div dangerouslySetInnerHTML={{ __html: content }} />
      {readMore ? <ReadMore post={post} /> : ""}
    </BlogContainer>
  );
}
