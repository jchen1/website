import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface ProjectsProps {
  page: Omit<MarkdownItem, "content"> &
    Pick<MarkdownHtml, "contentHTML" | "excerpt">;
}

export default function Projects({ page }: ProjectsProps) {
  return <BlogPost post={page} />;
}

export const getStaticProps: GetStaticProps<ProjectsProps> = async () => {
  const page = getPageBySlug("projects", ["title", "content"]);
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
