import React, { useEffect, useRef } from "react";
import Image from "components/Image";

import { BASE_URL } from "../lib/constants";

import styles from "styles/components/Blog.module.scss";

import Meta from "./Meta";
import Byline from "./Byline";

import Title from "./Title";
import PostCTA from "./PostCTA";
import RelatedPosts from "./RelatedPosts";

const DESCRIPTION_MAX_LENGTH = 200;

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

export default function BlogPost({ post, opts = {}, relatedPosts = [] }) {
  const {
    title,
    homepage,
    date,
    slug,
    author,
    heroImage,
    ogImage,
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
    titleClass,
  } = opts;

  const description =
    excerpt.length > DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const hasOGImage = ogImage || heroImage;

  const meta = {
    title: title,
    "og:title": title,
    description: description,
    "og:image": `https://${BASE_URL}${
      ogImage || heroImage || "/images/headshot-1200.jpg"
    }`,
    "twitter:card": hasOGImage ? "summary_large_image" : "summary",
    "og:type": "article",
  };

  return (
    <article className={styles.article}>
      {setTitle !== false && <Meta {...meta} />}
      <Title
        headingLevel={headingLevel}
        title={title}
        slug={slug}
        homepage={homepage}
        noLink={noLink}
        className={titleClass}
      />
      {showDate !== false && <Byline date={date} slug={slug} />}
      {heroImage && (
        <figure className={styles.imgContainer}>
          <Image
            src={heroImage}
            alt={title}
            width={heroImageSize.width}
            height={heroImageSize.height}
            layout="responsive"
            priority={preloadHero === true}
            className="background"
          />
        </figure>
      )}
      {/\<script\>/.test(contentHTML) ? (
        <InnerHTML html={contentHTML} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
      )}
      {showScroll && (
        <>
          <PostCTA />
          <RelatedPosts posts={relatedPosts} />

          <a
            className={styles.scrollToTop}
            href=""
            onClick={e => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Scroll to top
          </a>
        </>
      )}
    </article>
  );
}
