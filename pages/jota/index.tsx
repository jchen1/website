import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface JOTAProps {
  page: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt">;
}

export default function JOTA({ page }: JOTAProps) {
  return <BlogPost post={page} />;
}

export const getStaticProps: GetStaticProps<JOTAProps> = async () => {
  const page = getPageBySlug("jota-index", ["title", "content"]);
  const { contentHTML, excerpt } = await markdownToHtml(page.content || "");
  const { content: _content, ...pageFields } = page;

  return {
    props: {
      page: {
        ...pageFields,
        contentHTML,
        excerpt,
      },
    },
  };
};
