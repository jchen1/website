import React from "react";

import Title from "./Title";

import styles from "styles/components/RelatedPosts.module.scss";

function RelatedPost({ post }) {
  return <Title headingLevel={4} title={post.title} slug={post.slug} />;
}

export default function RelatedPosts({ posts }) {
  return (
    <section className={styles.container}>
      <h2>Related Posts</h2>
      {posts.map(p => (
        <RelatedPost post={p} />
      ))}
    </section>
  );
}
