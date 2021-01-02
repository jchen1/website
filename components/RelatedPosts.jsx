import React from "react";
import Link from "next/link";

import styles from "styles/components/RelatedPosts.module.scss";

export default function RelatedPosts({ posts }) {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Related Posts</h2>
      {posts.map(p => (
        <h5 className={styles.post}>
          <Link href={`/posts/${encodeURIComponent(p.slug)}/`}>
            <a>{p.title}</a>
          </Link>
        </h5>
      ))}
    </section>
  );
}
