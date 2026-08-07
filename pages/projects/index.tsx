import React from "react";
import type { GetStaticProps } from "next";

import { getPageBySlug, markdownToHtml } from "lib/blogs";
import BlogPost from "components/BlogPost";

import type { MarkdownHtml, MarkdownItem } from "lib/types";

interface ProjectsProps {
  page: MarkdownItem & MarkdownHtml;
}

export default function Projects({ page }: ProjectsProps) {
  return <BlogPost post={page} />;
}

export const getStaticProps: GetStaticProps<ProjectsProps> = async () => {
  const page = getPageBySlug("projects", ["title", "content"]);
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
