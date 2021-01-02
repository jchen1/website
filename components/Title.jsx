import React from "react";
import Link from "next/link";

import { slugToHref } from "lib/util";

export default function Title({ title, slug, className }) {
  if (!slug) {
    return <h1 className={className}>{title}</h1>;
  }

  return (
    <h1 className={className}>
      <Link href={slugToHref(slug)}>
        <a>{title}</a>
      </Link>
    </h1>
  );
}
