import Link from "next/link";

import { getAllPages } from "lib/track/pages";

import Title from "components/Title";

import styles from "styles/components/Blog.module.scss";

export default function Index({ pages }) {
  return (
    <article className={styles.article}>
      <Title title="Track Utilities" />
      <p>Calculators and other utilities related to track and field</p>
      <ul>
        {pages.map(({ page, title }) => (
          <li key={page}>
            <Link href={`/projects/track/${page}`} passHref>
              <a>{title}</a>
            </Link>
          </li>
        ))}
      </ul>{" "}
    </article>
  );
}

export async function getStaticProps() {
  const pages = getAllPages();
  return {
    props: {
      pages,
    },
  };
}
