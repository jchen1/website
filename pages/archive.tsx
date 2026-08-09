import React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";

import { ARCHIVE_FIELDS, getAllPosts } from "../lib/blogs";

import styles from "styles/pages/archive.module.scss";

import type { MarkdownItem } from "../lib/types";

export type ArchivePost = Pick<MarkdownItem, "title" | "date" | "slug">;

export type ArchiveItemProps = ArchivePost & {
  prefix?: string;
};

export interface ArchiveProps {
  posts: ArchivePost[];
  title: string;
  prefix?: string;
}

export function ArchiveItem({ title, date, slug, prefix }: ArchiveItemProps) {
  return (
    <div className={styles.wrapper}>
      <h4 className={styles.item}>
        <Link href={`/${prefix ?? "posts"}/${slug}`} prefetch={false}>
          {title}
        </Link>
      </h4>
      <p className={styles.date}>{date}</p>
    </div>
  );
}

export default function Archive(props: ArchiveProps) {
  const { posts, title, prefix } = props;

  const postsByYear: [number | null, ArchivePost[]][] = [];
  let currentYear: number | null = null;
  let currentYearPosts: ArchivePost[] = [];

  posts.forEach(post => {
    const year = new Date(post.date!).getFullYear();
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
            <ArchiveItem {...post} key={post.slug} prefix={prefix} />
          ))}
        </section>
      ))}
    </section>
  );
}

export const getStaticProps: GetStaticProps<ArchiveProps> = async () => {
  const posts = getAllPosts(ARCHIVE_FIELDS).map(
    ({ tags: _tags, draft: _draft, ...post }) => post,
  );

  return {
    props: {
      posts,
      title: "Archive",
    },
  };
};
