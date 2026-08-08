export type SearchIndexGroup = "Posts" | "Pages" | "Meet reports";

export interface SearchIndexItem {
  title: string;
  // Route with trailing slash, e.g. "/posts/foo/"
  route: string;
  group: SearchIndexGroup;
  // ISO date ("YYYY-MM-DD") for dated content; omitted for pages
  date?: string;
}

export interface SearchIndex {
  v: 1;
  items: SearchIndexItem[];
}

export const SEARCH_INDEX_PATH = "/search-index.json";
