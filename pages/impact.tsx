import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";
import ConvertKit from "components/ConvertKit";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface ImpactProps {
  page: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt">;
}

export default function Impact({ page }: ImpactProps) {
  return (
    <>
      <BlogPost post={page} />
      <ConvertKit />
    </>
  );
}

export const getStaticProps: GetStaticProps<ImpactProps> = async () => {
  const page = getPageBySlug("impact", ["title", "content"]);
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
