import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "../../lib/types";

interface JotaPrivacyProps {
  page: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt">;
}

export default function jotaPrivacy({ page }: JotaPrivacyProps) {
  return <BlogPost post={page} opts={{ showDate: false }} />;
}

export const getStaticProps: GetStaticProps<JotaPrivacyProps> = async () => {
  const page = getPageBySlug("jota-privacy", ["title", "content"]);
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
