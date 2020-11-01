import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";

import { Colors, BASE_URL } from "../lib/constants";
import Meta from "./Meta";
import { Small } from "./typography";

const OG_DESCRIPTION_MAX_LENGTH = 200;

const ReadMoreLink = styled(Small).attrs({ as: "a" })``;

const DateComp = styled(Small)`
  font-style: italic;
  color: ${Colors.GRAY};
`;

function ReadMore({ post }) {
  return (
    <Link key={post.slug} href="/posts/[slug]" as={`/posts/${post.slug}`}>
      <ReadMoreLink>Read More</ReadMoreLink>
    </Link>
  );
}

const ScrollToTop = styled.a`
  padding-top: 2rem;
  font-style: italic;
  font-size: 0.75em;
`;

export const BlogContainer = styled.article`
  padding-bottom: 2em;
  border-bottom: 1px solid ${Colors.LIGHT_GRAY};
  width: 100%;

  display: grid;
  grid-template-columns: 1fr min(65ch, 100%) 1fr;

  & > * {
    grid-column: 2;
  }

  .full-bleed {
    width: 100%;
    grid-column: 1 / -1;
  }

  &:last-of-type {
    padding-bottom: 1em;
    border-bottom: none;
  }

  &:first-child {
    h1 {
      margin-top: 0;
    }
  }

  blockquote {
    margin: 1.8em 0.8em;
    border-left: 2px solid $gray;
    padding: 0.1em 1em;
    color: ${Colors.GRAY};
    font-size: 22px;
    font-style: italic;
  }
`;

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
  const {
    title,
    homepage,
    date,
    preimage,
    slug,
    author,
    contentHTML,
    excerptHTML,
    excerpt,
  } = post;
  const {
    noLink,
    readMore,
    showDate,
    headingLevel,
    setTitle,
    showScroll,
  } = opts;
  const dateStr = formatDate(new Date(date));

  const displayHTML = readMore ? excerptHTML : contentHTML;
  const ogDescription =
    excerpt.length > OG_DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, OG_DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const meta = {
    title: title,
    "og:title": title,
    "og:description": ogDescription,
    "og:image": `https://${BASE_URL}/images/${
      preimage ? preimage : "profile.jpg"
    }`,
    "og:type": "article",
  };

  return (
    <BlogContainer>
      {setTitle !== false ? <Meta {...meta} /> : ""}
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
      {/\<script\>/.test(displayHTML) && !readMore ? (
        <InnerHTML html={displayHTML} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: displayHTML }} />
      )}
      {readMore ? <ReadMore post={post} /> : ""}
      {showScroll ? (
        <ScrollToTop
          href=""
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          Scroll to top
        </ScrollToTop>
      ) : (
        ""
      )}
    </BlogContainer>
  );
}
