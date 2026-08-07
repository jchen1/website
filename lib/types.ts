// Shared domain types.

// A markdown content item (post, page, or meet report) as returned by the
// lib/blogs getters. All frontmatter-derived fields are optional because
// callers pick which fields to expose via a `fields` array; `draft` is
// always present.
export interface MarkdownItem {
  draft: boolean;
  slug?: string;
  content?: string;
  title?: string;
  date?: string;
  /** comma-separated list, e.g. "track,review" */
  tags?: string;
  heroImage?: string;
  ogImage?: string;
  author?: string;
  layout?: string;
}

// Result of rendering a markdown document with lib/blogs#markdownToHtml.
export interface MarkdownHtml {
  contentHTML: string;
  excerptHTML: string;
  excerpt: string;
  postExcerptAnchor: string;
}

// Meta-tag name/content pairs rendered by components/Meta. Pages export
// these as a `metas` named export (see lib/track/pages) or build them
// inline; keys other than the well-known ones are emitted verbatim as
// <meta name=... content=...> (e.g. "og:image", "twitter:card").
export interface Metas {
  title: string;
  description?: string;
  [name: string]: string | undefined;
}

// A single event from the personal-metrics API (see lib/api, lib/state).
export interface MetricEvent {
  event: string;
  time: string | number;
  /** payload shape varies per event type (number, or an object) */
  data: unknown;
  source: {
    major: string;
    minor: string;
  };
}
