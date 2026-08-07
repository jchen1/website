import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";
import ConvertKit from "components/ConvertKit";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface ImpactProps {
  page: MarkdownItem & MarkdownHtml;
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
