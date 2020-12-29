import React from "react";
import Link from "next/link";

import MainContainer from "../components/containers/MainContainer";
import { ARCHIVE_FIELDS, getAllPosts } from "../lib/blogs";

import styles from "styles/pages/archive.module.scss";
import BlogContainer from "components/containers/BlogContainer";

export function ArchiveItem({ title, date, slug }) {
  return (
    <div className={styles.wrapper}>
      <h4 className={styles.item}>
        <Link href={`/posts/${slug}`} passHref prefetch={false}>
          <a>{title}</a>
        </Link>
      </h4>
      <p className={styles.date}>{date}</p>
    </div>
  );
}

export default function Archive(props) {
  const { posts } = props;

  const postMarkup = posts.map(post => <ArchiveItem {...post} />);

  return (
    <MainContainer>
      <BlogContainer>
        <h1 className={`${styles.title} title highlight`}>Post Archive</h1>
        {postMarkup}
      </BlogContainer>
    </MainContainer>
  );
}

export async function getStaticProps({ params }) {
  const posts = getAllPosts(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
    },
  };
}
