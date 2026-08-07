import React from "react";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "styles/components/Pagination.module.scss";

interface MaybeLinkProps {
  page?: string | false | null;
  children: ReactNode;
}

function MaybeLink({ page, children }: MaybeLinkProps) {
  if (page) {
    return (
      <Link key={page} href={page} className={styles.pageLink}>
        {children}
      </Link>
    );
  }

  return <span />;
}

interface PaginationProps {
  next?: string | false | null;
  prev?: string | false | null;
}

export default function Pagination({ next, prev }: PaginationProps) {
  return (
    <section className={styles.container}>
      <MaybeLink page={prev}>← Previous</MaybeLink>
      <MaybeLink page={next}>Next →</MaybeLink>
    </section>
  );
}
