import React from "react";
import Link from "next/link";

import Image from "components/Image";
import styles from "styles/components/Blog.module.scss";

import Byline from "./Byline";
import Title from "./Title";

function ReadMore({ post }) {
  const href = `/posts/${post.slug}#${post.postExcerptAnchor || ""}`;
  return (
    <Link href={href} passHref prefetch={false}>
      <a className={styles.readMore}>Read More →</a>
    </Link>
  );
}

// Just a snippet!
export default function BlogSnippet({ post, opts = {} }) {
  const { title, date, slug, heroImage, excerptHTML, heroImageSize } = post;

  const { headingLevel, preloadHero } = opts;

  return (
    <article className={styles.article}>
      <Title headingLevel={headingLevel} title={title} slug={slug} />
      <Byline date={date} slug={slug} />
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
      <div dangerouslySetInnerHTML={{ __html: excerptHTML }} />
      <ReadMore post={post} />
    </article>
  );
}
