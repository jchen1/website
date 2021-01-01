import React from "react";
import Link from "next/link";

export default function Title({
  headingLevel,
  title,
  slug,
  homepage,
  className,
}) {
  const Heading = `h${headingLevel || 1}`;

  if (!slug && !homepage) {
    return <Heading className={className}>{title}</Heading>;
  }

  if (homepage) {
    return (
      <Heading className={className}>
        <a href={homepage} target="_blank">
          {title}
        </a>
      </Heading>
    );
  }

  return (
    <Heading className={className}>
      <Link href={`/posts/${encodeURIComponent(slug)}/`}>
        <a>{title}</a>
      </Link>
    </Heading>
  );
}
