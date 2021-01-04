import React from "react";
import Link from "next/link";

export default function Title({ title, slug, className }) {
  if (!slug) {
    return <h1 className={className}>{title}</h1>;
  }

  return (
    <h1 className={className}>
      <Link href={`/posts/${encodeURIComponent(slug)}/`}>
        <a>{title}</a>
      </Link>
    </h1>
  );
}
