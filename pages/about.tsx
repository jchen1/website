import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";
import ConvertKit from "components/ConvertKit";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface AboutProps {
  page: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt">;
}

export default function About({ page }: AboutProps) {
  return (
    <>
      <BlogPost post={page} />
      <ConvertKit />
    </>
  );
}

export const getStaticProps: GetStaticProps<AboutProps> = async () => {
  const page = getPageBySlug("about", ["title", "content"]);
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
