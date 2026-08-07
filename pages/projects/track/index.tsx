import Link from "next/link";
import type { GetStaticProps } from "next";

import { getAllPages } from "lib/track/pages";
import type { TrackPage } from "lib/track/pages";

import Title from "components/Title";

import styles from "styles/components/Blog.module.scss";

interface IndexProps {
  pages: TrackPage[];
}

export default function Index({ pages }: IndexProps) {
  return (
    <article className={styles.article}>
      <Title title="Track Utilities" />
      <p>Calculators and other utilities related to track and field</p>
      <ul>
        {pages.map(({ page, title }) => (
          <li key={page}>
            <Link href={`/projects/track/${page}`}>{title}</Link>
          </li>
        ))}
      </ul>{" "}
    </article>
  );
}

export const getStaticProps: GetStaticProps<IndexProps> = async () => {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
};
