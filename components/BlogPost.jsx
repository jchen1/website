import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import Head from "next/head";

import { Colors } from "../lib/constants";
import { BlogContainer } from "../components/containers";

const ReadMoreLink = styled.a`
  font-size: 15px;
`;

const DateComp = styled.em`
  color: ${Colors.GRAY};
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
      <Link key={slug} href="/posts/[slug]/" as={`/posts/${slug}/`}>
        <a>{title}</a>
      </Link>
    </Heading>
  );
}

function formatDate(date) {
  const month = date.toLocaleDateString("default", {
    month: "long",
    timeZone: "UTC",
  });
  const day = date.toLocaleDateString("default", {
    day: "numeric",
    timeZone: "UTC",
  });
  const year = date.toLocaleDateString("default", {
    year: "numeric",
    timeZone: "UTC",
  });

  const suffix = { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";

  return `${month} ${day}${suffix}, ${year}`;
}

// https://github.com/christo-pr/dangerously-set-html-content/blob/master/src/index.js
function InnerHTML(props) {
  const { html, ...rest } = props;
  const divRef = useRef(null);

  useEffect(() => {
    if (!html) return;

    const slotHtml = document.createRange().createContextualFragment(html); // Create a 'tiny' document and parse the html string
    divRef.current.innerHTML = ""; // Clear the container
    divRef.current.appendChild(slotHtml); // Append the new content
  }, [html]);

  return <div {...rest} ref={divRef}></div>;
}

export default function BlogPost({ post, opts = {} }) {
  const { title, homepage, date, preimage, slug, author, content } = post;
  const { noLink, readMore, showDate, headingLevel, setTitle } = opts;
  const dateStr = formatDate(new Date(date));

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
      {preimage ? (
        <img src={`/images/${preimage}`} alt={preimage.replace(/\..*$/, "")} />
      ) : (
        ""
      )}
      {showDate !== false ? <DateComp>{dateStr}</DateComp> : ""}
      {/\<script\>/.test(content) && !readMore ? (
        <InnerHTML html={content} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: content }} />
      )}
      {readMore ? <ReadMore post={post} /> : ""}
    </BlogContainer>
  );
}
