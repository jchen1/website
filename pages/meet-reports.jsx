import React from "react";
import Link from "next/link";

import { ARCHIVE_FIELDS, getAllMeetReports } from "../lib/blogs";

import styles from "styles/pages/archive.module.scss";

export function MeetReportItem({ title, date, slug }) {
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

export default function MeetReports(props) {
  const { posts } = props;

  const postMarkup = posts.map(post => (
    <MeetReportItem {...post} key={post.slug} />
  ));

  return (
    <section className={styles.container}>
      <h1 className={`${styles.title} title`}>Meet Reports</h1>
      {postMarkup}
    </section>
  );
}

export async function getStaticProps({ params }) {
  const posts = getAllMeetReports(ARCHIVE_FIELDS);

  return {
    props: {
      posts,
    },
  };
}
