import React from "react";

import Title from "./Title";

import styles from "styles/components/RelatedPosts.module.scss";

export default function RelatedPosts({ posts }) {
  return (
    <section className={styles.container}>
      <h2 className={styles.heading}>Related Posts</h2>
      {posts.map(p => (
        <Title
          headingLevel={5}
          title={p.title}
          slug={p.slug}
          className={styles.post}
        />
      ))}
    </section>
  );
}
