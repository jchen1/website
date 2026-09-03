import dynamic from "next/dynamic";

import type { ComponentType, ReactNode } from "react";

const MARKDOWN_COMPONENT_PATTERN =
  /<div\b[^>]*\bdata-component=(["'])([a-z0-9-]+)\1[^>]*>\s*<\/div>/gi;

const POST_COMPONENTS: Record<string, ComponentType> = {
  "fastest-indoor-tracks-table": dynamic(
    () => import("./FastestIndoorTracksTable"),
  ),
};

interface PostContentProps {
  html: string;
}

export default function PostContent({ html }: PostContentProps) {
  const content: ReactNode[] = [];
  let previousIndex = 0;

  for (const match of html.matchAll(MARKDOWN_COMPONENT_PATTERN)) {
    const Component = POST_COMPONENTS[match[2]];
    if (!Component || match.index === undefined) continue;

    const precedingHtml = html.slice(previousIndex, match.index);
    if (precedingHtml) {
      content.push(
        <div
          key={`html-${previousIndex}`}
          dangerouslySetInnerHTML={{ __html: precedingHtml }}
        />,
      );
    }

    content.push(<Component key={`${match[2]}-${match.index}`} />);
    previousIndex = match.index + match[0].length;
  }

  if (content.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  const remainingHtml = html.slice(previousIndex);
  if (remainingHtml) {
    content.push(
      <div
        key={`html-${previousIndex}`}
        dangerouslySetInnerHTML={{ __html: remainingHtml }}
      />,
    );
  }

  return <>{content}</>;
}
