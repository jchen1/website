import React from "react";
import Link from "next/link";

export default function Title({ headingLevel, title, slug, className }) {
  const Heading = `h${headingLevel || 1}`;

  if (!slug) {
    return <Heading className={className}>{title}</Heading>;
  }

  return (
    <Heading className={className}>
      <Link href={`/posts/${encodeURIComponent(slug)}/`}>
        <a>{title}</a>
      </Link>
    </Heading>
  );
}
