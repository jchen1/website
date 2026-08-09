import React from "react";
import Link from "next/link";

import Image from "components/Image";
import styles from "styles/components/Blog.module.scss";

import Byline from "./Byline";
import Title from "./Title";

import type { MarkdownItem } from "lib/types";
import type { HeroImageSize } from "./BlogPost";

export interface Snippet extends Omit<
  MarkdownItem,
  "content" | "tags" | "draft"
> {
  excerptHTML: string;
  postExcerptAnchor?: string;
  heroImageSize?: HeroImageSize;
}

function ReadMore({ post }: { post: Snippet }) {
  const href = `/posts/${post.slug}#${post.postExcerptAnchor || ""}`;
  return (
    <Link href={href} prefetch={false} className={styles.readMore}>
      Read More →
    </Link>
  );
}

interface BlogSnippetProps {
  post: Snippet;
  opts?: { preloadHero?: boolean };
}

// Just a snippet!
export default function BlogSnippet({ post, opts = {} }: BlogSnippetProps) {
  const { title, date, slug, heroImage, excerptHTML, heroImageSize } = post;

  const { preloadHero } = opts;

  return (
    <article className={styles.article}>
      <Title title={title} slug={slug} />
      <Byline date={date} />
      {heroImage && (
        <figure className={styles.imgContainer}>
          <Image
            src={heroImage}
            alt={title}
            width={heroImageSize!.width}
            height={heroImageSize!.height}
            layout="responsive"
            priority={preloadHero === true}
            className="background"
          />
        </figure>
      )}
      <div dangerouslySetInnerHTML={{ __html: excerptHTML }} />
      <ReadMore post={post} />
    </article>
  );
}
