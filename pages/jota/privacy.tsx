import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "../../lib/blogs";
import BlogPost from "../../components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "../../lib/types";

interface JotaPrivacyProps {
  page: MarkdownItem & MarkdownHtml;
}

export default function jotaPrivacy({ page }: JotaPrivacyProps) {
  return <BlogPost post={page} opts={{ showDate: false }} />;
}

export const getStaticProps: GetStaticProps<JotaPrivacyProps> = async () => {
  const page = getPageBySlug("jota-privacy", ["title", "content"]);
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
