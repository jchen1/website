import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";

import { Colors, BASE_URL } from "../lib/constants";
import formatDate from "../lib/util/formatDate";

import { Twitter } from "./Icon";
import Title from "./Title";
import { BlogContainer, Border } from "./containers/BlogContainer";
import Tags from "./Tags";

const DESCRIPTION_MAX_LENGTH = 200;

const ReadMoreLink = styled.small.attrs({ as: "a" })`
  width: fit-content;
`;

function ReadMore({ post }) {
  return (
    <Link href={`/posts/${post.slug}`} passHref prefetch={false}>
      <ReadMoreLink>Read More →</ReadMoreLink>
    </Link>
  );
}

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
      <small>{dateStr}</small>
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

const HeroImageContainer = styled.div`
  padding: 15px 0;
`;

// Just a snippet!
export default function BlogSnippet({ post, opts = {} }) {
  const {
    title,
    homepage,
    date,
    slug,
    heroImage,
    excerptHTML,
    excerpt,
    heroImageSize,
    tags,
  } = post;

  const {
    noLink,
    headingLevel,
    preloadHero,
  } = opts;

  const description =
    excerpt.length > DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const tagArray = (tags || "").split(",");

  return (
    <>
      <BlogContainer>
        <Title
          headingLevel={headingLevel}
          title={title}
          slug={slug}
          homepage={homepage}
          noLink={noLink}
        />
        <Byline date={date} slug={slug} />
        <Tags tags={tagArray} />
        {heroImage && (
          <HeroImageContainer>
            <Image
              src={heroImage}
              alt={title}
              width={heroImageSize.width}
              height={heroImageSize.height}
              layout="responsive"
              priority={preloadHero === true}
              loading={preloadHero === true ? "eager" : "lazy"}
            />
          </HeroImageContainer>
        )}
        <div dangerouslySetInnerHTML={{ __html: excerptHTML }} />
        <ReadMore post={post} />
      </BlogContainer>
      <Border />
    </>
  );
}
