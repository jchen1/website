import React from "react";
import Link from "next/link";

import MainContainer from "../components/containers/MainContainer";
import { ARCHIVE_FIELDS, getAllPosts } from "../lib/blogs";

import styles from "styles/pages/archive.module.scss";

export function ArchiveItem({ title, date, slug }) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.item}>
        <Link href={`/posts/${slug}`} passHref prefetch={false}>
          {title}
        </Link>
      </h3>
      <p className={styles.date}>{date}</p>
    </div>
  );
}

export default function Archive(props) {
  const { posts } = props;

  const postMarkup = posts.map(post => <ArchiveItem {...post} />);

  return (
    <MainContainer>
      <h1 className="title">Post Archive</h1>
      {postMarkup}
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