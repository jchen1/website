import React from "react";
import Link from "next/link";

import styles from "styles/components/Pagination.module.scss";

function MaybeLink({ page, children }) {
  if (page) {
    return (
      <Link key={page} href={page}>
        <a className={styles.pageLink}>{children}</a>
      </Link>
    );
  }

  return <span />;
}

export default function Pagination({ next, prev }) {
  return (
    <section className={styles.container}>
      <MaybeLink page={prev}>← Previous</MaybeLink>
      <MaybeLink page={next}>Next →</MaybeLink>
    </section>
  );
}
