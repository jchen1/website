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
  const { posts, title } = props;

  const postsByYear = [];
  let currentYear = null;
  let currentYearPosts = [];

  posts.forEach(post => {
    const year = new Date(post.date).getFullYear();
    if (year !== currentYear) {
      if (currentYearPosts.length > 0) {
        postsByYear.push([currentYear, currentYearPosts]);
      }
      currentYear = year;
      currentYearPosts = [];
    }
    currentYearPosts.push(post);
  });

  if (currentYearPosts.length > 0) {
    postsByYear.push([currentYear, currentYearPosts]);
  }

  return (
    <section className={styles.container}>
      <h1 className={`${styles.title} title`}>{title}</h1>
      {postsByYear.map(([year, yearPosts]) => (
        <section className={styles.yearContainer} key={year}>
          <h3 className={styles.year}>{year}</h3>
          {yearPosts.map(post => (
            <ArchiveItem {...post} key={post.slug} />
          ))}
        </section>
      ))}
    </section>
  );
}

export async function getStaticProps({ params }) {
  const posts = getAllPosts(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
      title: "Archive",
    },
  };
}
