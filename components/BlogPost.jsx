import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import Image from "next/image";

import { BASE_URL } from "../lib/constants";

import Meta from "./Meta";
import { BlogContainer, Border } from "../components/containers/BlogContainer";
import Byline from "./Byline";

import Title from "./Title";
import Tags from "./Tags";
import PostCTA from "./PostCTA";

const DESCRIPTION_MAX_LENGTH = 200;

const ScrollToTop = styled.a`
  padding-top: 2rem;
  font-size: 0.75em;
`;

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

const HeroImageContainer = styled.div`
  padding: 15px 0;
`;

export default function BlogPost({ post, opts = {} }) {
  const {
    title,
    homepage,
    date,
    slug,
    author,
    heroImage,
    contentHTML,
    excerpt,
    heroImageSize,
    tags,
  } = post;

  const {
    noLink,
    showDate,
    headingLevel,
    setTitle,
    showScroll,
    preloadHero,
  } = opts;

  const description =
    excerpt.length > DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const meta = {
    title: title,
    "og:title": title,
    description: description,
    "og:image": `https://${BASE_URL}${heroImage || "/images/profile.jpg"}`,
    "twitter:card": heroImage ? "summary_large_image" : "summary",
    "og:type": "article",
  };

  const tagArray = (tags || "").split(",");

  return (
    <>
      <BlogContainer>
        {setTitle !== false && <Meta {...meta} />}
        <Title
          headingLevel={headingLevel}
          title={title}
          slug={slug}
          homepage={homepage}
          noLink={noLink}
        />
        {showDate !== false && <Byline date={date} slug={slug} />}
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
        {/\<script\>/.test(contentHTML) ? (
          <InnerHTML html={contentHTML} />
        ) : (
          <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
        )}
        {showScroll && (
          <>
            <PostCTA />
            <ScrollToTop
              href=""
              onClick={e => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Scroll to top
            </ScrollToTop>
          </>
        )}
      </BlogContainer>
      <Border />
    </>
  );
}
