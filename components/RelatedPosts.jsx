import React from "react";
import Link from "next/link";

import styles from "styles/components/RelatedPosts.module.scss";

export default function RelatedPosts({ posts, title = "Related Posts" }) {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>{title}</h2>
      {posts.map(p => {
        const slug = p.slug
          ? `/posts/${encodeURIComponent(p.slug)}`
          : p.fullSlug;
        return (
          <h5 className={styles.post} key={slug}>
            <Link href={slug}>
              <a>{p.title}</a>
            </Link>
          </h5>
        );
      })}
    </section>
  );
}
