import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";

import Byline from "./Byline";
import Title from "./Title";
import { BlogContainer, Border } from "./containers/BlogContainer";
import Tags from "./Tags";

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
    heroImageSize,
    tags,
  } = post;

  const { noLink, headingLevel, preloadHero } = opts;

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
