import React from "react";
import Link from "next/link";

import styles from "styles/components/RelatedPosts.module.scss";

// Either `slug` (a blog post, linked under /posts) or `fullSlug` (an absolute
// path to a non-post page) identifies where the entry links to.
export interface RelatedPost {
  title?: string;
  slug?: string;
  fullSlug?: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  title?: string;
}

export default function RelatedPosts({
  posts,
  title = "Related Posts",
}: RelatedPostsProps) {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>{title}</h2>
      {posts.map(p => {
        const slug = p.slug
          ? `/posts/${encodeURIComponent(p.slug)}`
          : p.fullSlug;
        return (
          <h5 className={styles.post} key={slug}>
            <Link href={slug as string}>{p.title}</Link>
          </h5>
        );
      })}
    </section>
  );
}
