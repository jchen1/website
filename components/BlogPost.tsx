import React, { useEffect, useRef } from "react";
import Image from "components/Image";

import { BASE_URL, CONTENT_IMAGE_SIZES } from "../lib/constants";

import styles from "styles/components/Blog.module.scss";

import Meta from "./Meta";
import Byline from "./Byline";

import Title from "./Title";
import PostCTA from "./PostCTA";
import PostContent from "./PostContent";
import RelatedPosts from "./RelatedPosts";

import type { ComponentProps } from "react";
import type { MarkdownHtml, MarkdownItem, Metas } from "lib/types";
import type { RelatedPost } from "./RelatedPosts";

const DESCRIPTION_MAX_LENGTH = 200;

// Intrinsic size of the hero image, empty when the post has no hero image or
// the file could not be measured.
export interface HeroImageSize {
  width?: number;
  height?: number;
}

export interface Post
  extends
    Omit<MarkdownItem, "content">,
    Pick<MarkdownHtml, "contentHTML" | "excerpt"> {
  heroImageSize?: HeroImageSize;
}

export interface BlogPostOpts {
  showDate?: boolean;
  setTitle?: boolean;
  showScroll?: boolean;
  preloadHero?: boolean;
  titleClass?: string;
}

interface InnerHTMLProps extends Omit<ComponentProps<"div">, "children"> {
  html: string;
}

// https://github.com/christo-pr/dangerously-set-html-content/blob/master/src/index.js
function InnerHTML(props: InnerHTMLProps) {
  const { html, ...rest } = props;
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html) return;

    const slotHtml = document.createRange().createContextualFragment(html); // Create a 'tiny' document and parse the html string
    divRef.current!.innerHTML = ""; // Clear the container
    divRef.current!.appendChild(slotHtml); // Append the new content
  }, [html]);

  // The div is empty in the SSR HTML — the content only exists once the
  // effect above runs. data-eager-hydrate tells the deferred-hydration
  // activator in pages/_document.tsx to load the runtime immediately on
  // such pages instead of waiting for interaction or idle.
  return <div data-eager-hydrate="" {...rest} ref={divRef}></div>;
}

interface BlogPostProps {
  post: Post;
  opts?: BlogPostOpts;
  relatedPosts?: RelatedPost[];
}

export default function BlogPost({
  post,
  opts = {},
  relatedPosts = [],
}: BlogPostProps) {
  const {
    title,
    date,
    slug,
    heroImage,
    ogTitle,
    ogImage,
    description: frontmatterDescription,
    contentHTML,
    excerpt,
    heroImageSize,
  } = post;

  const { showDate, setTitle, showScroll, preloadHero, titleClass } = opts;

  const description = frontmatterDescription
    ? frontmatterDescription
    : excerpt.length > DESCRIPTION_MAX_LENGTH
      ? excerpt.substring(0, DESCRIPTION_MAX_LENGTH - 3) + "..."
      : excerpt;

  const hasOGImage = ogImage || heroImage;

  const meta: Metas = {
    title: title!,
    "og:title": ogTitle || title,
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
      <Title title={title} slug={slug} className={titleClass} />
      {showDate !== false && <Byline date={date} slug={slug} />}
      {heroImage && (
        <figure className={styles.imgContainer}>
          <Image
            src={heroImage}
            alt={title}
            width={heroImageSize!.width}
            height={heroImageSize!.height}
            layout="responsive"
            sizes={CONTENT_IMAGE_SIZES}
            priority={preloadHero === true}
            className="background"
          />
        </figure>
      )}
      {contentHTML.toLowerCase().includes("<script") ? (
        <InnerHTML html={contentHTML} />
      ) : (
        <PostContent html={contentHTML} />
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
