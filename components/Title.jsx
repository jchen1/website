import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Title({
  headingLevel,
  title,
  slug,
  homepage,
  noLink,
  className,
}) {
  const router = useRouter();
  const Heading = `h${headingLevel || 1}`;

  if (noLink) {
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

  useEffect(() => {
    router.prefetch(`/posts/${encodeURIComponent(slug)}`);
  }, []);

  return (
    <Heading className={className}>
      <Link href={`/posts/${encodeURIComponent(slug)}/`} prefetch={false}>
        <a>{title}</a>
      </Link>
    </Heading>
  );
}
