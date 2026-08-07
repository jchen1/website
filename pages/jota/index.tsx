import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface JOTAProps {
  page: MarkdownItem & MarkdownHtml;
}

export default function JOTA({ page }: JOTAProps) {
  return <BlogPost post={page} />;
}

export const getStaticProps: GetStaticProps<JOTAProps> = async () => {
  const page = getPageBySlug("jota-index", ["title", "content"]);
  const content = await markdownToHtml(page.content || "");

  return {
    props: {
      page: {
        ...page,
        ...content,
      },
    },
  };
};
