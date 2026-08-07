import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";
import ConvertKit from "components/ConvertKit";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface AboutProps {
  page: MarkdownItem & MarkdownHtml;
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
