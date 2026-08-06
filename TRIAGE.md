# Triage

Backlog of larger maintenance / improvement projects.

## 1. Modernize dependencies (in progress)

Upgrade all dependencies to current versions while keeping the existing stack
(Next.js pages router + Preact + styled-components + remark pipeline + custom
bundle-size optimizations). Risk areas: `next-plugin-preact` (unmaintained,
Next 12 only), internal `__NEXT_IMAGE_OPTS` usage in `lib/remarkPlugins.js`,
css-loader monkey-patching in `plugins/next-optimized-classnames.js`, the
ESM-only remark/unified ecosystem, deprecated remark plugins
(`remark-slug`, `remark-external-links`, `remark-highlight.js`), and
`next export` removal in Next 14+. Must verify dev server, prod build, and
static export output against the pre-upgrade baseline.

## 2. Convert fully to TypeScript

Migrate the codebase (components, lib, pages, scripts) from JS/JSX to
TypeScript. `lib/placement.ts` already exists; add a `tsconfig.json`, convert
incrementally, and type the markdown/frontmatter pipeline.

## 3. Cmd-K style navigation

Add a command-palette (⌘K) navigation for jumping to posts, pages, and
projects. Needs a search index over markdown content and a keyboard-driven UI
consistent with the site's bundle-size goals.
