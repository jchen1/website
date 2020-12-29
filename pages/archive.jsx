import React from "react";
import Link from "next/link";

import { ARCHIVE_FIELDS, getAllPosts } from "../lib/blogs";

import styles from "styles/pages/archive.module.scss";

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
    <>
      <h1 className={`${styles.title} title`}>Post Archive</h1>
      {postMarkup}
    </>
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
