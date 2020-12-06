import React from "react";
import Link from "next/link";
import Image from "components/Image";

import styles from "styles/components/Blog.module.scss";

import Byline from "./Byline";
import Title from "./Title";
import BlogContainer from "./containers/BlogContainer";
import Tags from "./Tags";

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
        <div className={styles.imgContainer}>
          <Image
            src={heroImage}
            alt={title}
            width={heroImageSize.width}
            height={heroImageSize.height}
            layout="responsive"
            priority={preloadHero === true}
          />
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: excerptHTML }} />
      <ReadMore post={post} />
    </BlogContainer>
  );
}
