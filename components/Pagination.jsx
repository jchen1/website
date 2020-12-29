import React from "react";
import Link from "next/link";

import styles from "styles/components/Pagination.module.scss";

// TODO - have "..." when pages.length > MAX_PAGES_TO_DISPLAY
const MAX_PAGES_TO_DISPLAY = 5;

// pages is an array of { link, title, isCurrent }
export default function Pagination({ pages }) {
  const pageMarkup = pages?.map(page => {
    return (
      <Link key={page.link} href={page.link}>
        <a
          className={[
            page.isCurrent ? styles.current : "",
            styles.pageLink,
          ].join(" ")}
        >
          {page.title}
        </a>
      </Link>
    );
  });

  return <section className={styles.container}>{pageMarkup}</section>;
}
