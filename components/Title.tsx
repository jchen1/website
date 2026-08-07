import React from "react";
import Link from "next/link";

interface TitleProps {
  title?: string;
  slug?: string;
  className?: string;
}

export default function Title({ title, slug, className }: TitleProps) {
  if (!slug) {
    return <h1 className={className}>{title}</h1>;
  }

  return (
    <h1 className={className}>
      <Link href={`/posts/${encodeURIComponent(slug)}/`}>{title}</Link>
    </h1>
  );
}
