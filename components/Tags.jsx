import React from "react";
import Link from "next/link";

import styles from "styles/components/Tags.module.scss";

// array of string tags
export default function Tags({ tags }) {
  const tagMarkup = tags
    ?.filter(t => t.length > 0)
    .sort()
    .map(tag => {
      return (
        <li key={tag} className={styles.tagItem}>
          {/* no prefetch - people don't click on tags */}
          <Link href={`/tag/${tag}`} prefetch={false}>
            <a>
              <small>{tag}</small>
            </a>
          </Link>
        </li>
      );
    });

  return <ul className={styles.container}>{tagMarkup}</ul>;
}
