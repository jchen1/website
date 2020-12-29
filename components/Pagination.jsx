import React from "react";
import Link from "next/link";

import styles from "styles/components/Pagination.module.scss";

function MaybeLink({ page, children }) {
  if (page) {
    return (
      <Link key={page.link} href={page.link}>
        <a className={styles.pageLink}>{children}</a>
      </Link>
    );
  }

  return (
    <a className={[styles.pageLink, styles.disabled].join(" ")}>{children}</a>
  );
}

// pages is an array of { link, title, isCurrent }
export default function Pagination({ pages }) {
  const indexOfCurrent = pages.findIndex(p => p.isCurrent);
  const next = pages[indexOfCurrent + 1];
  const prev = pages[indexOfCurrent - 1];

  return (
    <section className={styles.container}>
      <div className={styles.inner}>
        <MaybeLink page={prev}>← Previous</MaybeLink>
        <MaybeLink page={next}>Next →</MaybeLink>
      </div>
    </section>
  );
}
