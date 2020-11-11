import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

import { Colors, BASE_URL } from "../lib/constants";
import Meta from "./Meta";
import { Small } from "./typography";

import { Twitter } from "../components/Icon";
import Image from "next/image";

const DESCRIPTION_MAX_LENGTH = 200;

const ReadMoreLink = styled(Small).attrs({ as: "a" })`
  width: fit-content;
`;

function ReadMore({ post }) {
  return (
    <Link href={`/posts/${post.slug}`} passHref prefetch={false}>
      <ReadMoreLink>Read More →</ReadMoreLink>
    </Link>
  );
}

const ScrollToTop = styled.a`
  padding-top: 2rem;
  font-style: italic;
  font-size: 0.75em;
`;

export const BlogContainer = styled.article`
  width: 100%;

  display: grid;
  grid-template-columns: 1fr min(45rem, 100%) 1fr;

  & > * {
    grid-column: 2;
  }

  .full-bleed {
    width: 100%;
    grid-column: 1 / -1;
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

const Border = styled.div`
  padding-bottom: 2em;
  border-bottom: 1px solid ${Colors.LIGHT_GRAY};
  width: min(45rem, 100%);
  margin: 0 auto;

  &:last-of-type {
    padding-bottom: 1em;
    border-bottom: none;
  }
`;

function Title({ headingLevel, title, slug, homepage, noLink }) {
  const router = useRouter();
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

  useEffect(() => {
    router.prefetch(`/posts/${encodeURIComponent(slug)}`);
  }, []);

  return (
    <Heading>
      <Link href={`/posts/${encodeURIComponent(slug)}/`} prefetch={false}>
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

  const suffix =
    { 1: "st", 2: "nd", 3: "rd", 21: "st", 22: "nd", 23: "rd", 31: "st" }[
      day
    ] || "th";

  return `${month} ${day}${suffix}, ${year}`;
}

const DateComp = styled(Small)`
  font-style: italic;
`;

const BylineWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  color: ${Colors.GRAY};

  svg {
    fill: ${Colors.GRAY};
  }

  > * {
    padding-right: 0.5em;
  }
`;

function Byline({ date, slug }) {
  const dateStr = formatDate(new Date(date));

  return (
    <BylineWrapper>
      <DateComp>{dateStr}</DateComp>
      <Twitter
        href={`https://www.twitter.com/share?url=${encodeURIComponent(
          `https://${BASE_URL}/posts/${slug}/`
        )}`}
        label="Tweet this post"
        eventLabel="post"
        circle={true}
        size={25}
      />
    </BylineWrapper>
  );
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
    slug,
    author,
    heroImage,
    contentHTML,
    excerptHTML,
    excerpt,
    heroImageSize,
  } = post;

  const {
    noLink,
    readMore,
    showDate,
    headingLevel,
    setTitle,
    showScroll,
  } = opts;

  const displayHTML = readMore ? excerptHTML : contentHTML;
  const description =
    excerpt.length > DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const meta = {
    title: title,
    "og:title": title,
    description: description,
    "og:image": `https://${BASE_URL}${heroImage || "/images/profile.jpg"}`,
    "og:type": "article",
  };

  const HeroImageContainer = styled.div`
    padding: 15px 0;
  `;

  return (
    <>
      <BlogContainer>
        {setTitle !== false ? <Meta {...meta} /> : ""}
        <Title
          headingLevel={headingLevel}
          title={title}
          slug={slug}
          homepage={homepage}
          noLink={noLink}
        />
        {showDate !== false ? <Byline date={date} slug={slug} /> : ""}
        {heroImage ? (
          <HeroImageContainer>
            <Image
              src={heroImage}
              width={heroImageSize.width}
              height={heroImageSize.height}
            />
          </HeroImageContainer>
        ) : (
          ""
        )}
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
      <Border />
    </>
  );
}
