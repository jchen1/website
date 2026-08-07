import React from "react";
import Link from "next/link";

import styles from "styles/components/Tags.module.scss";

interface TagsProps {
  tags?: string[];
}

// array of string tags
export default function Tags({ tags }: TagsProps) {
  const tagMarkup = tags
    ?.filter(t => t.length > 0)
    .sort()
    .map(tag => {
      return (
        <li key={tag} className={styles.tagItem}>
          {/* no prefetch - people don't click on tags */}
          <Link href={`/tag/${tag}`} prefetch={false}>
            <small>{tag}</small>
          </Link>
        </li>
      );
    });

  return <ul className={styles.container}>{tagMarkup}</ul>;
}
