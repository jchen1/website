import React from "react";

import Title from "./Title";

import styles from "styles/components/RelatedPosts.module.scss";

export default function RelatedPosts({ posts }) {
  return (
    <section className={styles.container}>
      <h2>Related Posts</h2>
      {posts.map(p => (
        <Title headingLevel={4} title={p.title} slug={p.slug} />
      ))}
    </section>
  );
}
