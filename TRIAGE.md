# Triage

Backlog of larger maintenance / improvement projects.

## 1. Modernize dependencies (done — see jchen1/deps-modernization)

Upgraded to Next 15.5 (pages router, webpack) + preact 10.29 +
styled-components 6 + remark 15/unified 11 + eslint 9 flat config, keeping the
custom bundle-size machinery working. Follow-ups worth tracking:

- **Next 16 is blocked** until the webpack-dependent customizations (preact
  aliasing, css-module class minifier, svgr rule, `__NEXT_IMAGE_OPTS`-free
  image config) get Turbopack equivalents — or get dropped.
- Dev fast-refresh runs on a custom @prefresh/webpack integration in
  next.config.js (@prefresh/next itself only supports Next <=12 and was
  removed from the prefresh repo). If it breaks on a future Next upgrade,
  dev degrades to full reloads rather than failing.
- Sass `@import` is deprecated (silenced in next.config.js); migrating
  `styles/` to `@use`/`@forward` needs `sass-migrator` plus handling the
  `$inter-font-*` top-level vars in main.scss.
- Still unmaintained, pinned, and working: react-hooks-global-state 1.x,
  confetti-js, rss, gray-matter, css-class-generator, moment (maintenance
  mode), crypto-js (registry-deprecated).

## 2. Convert fully to TypeScript (done)

`lib`, `components`, `pages`, and `scripts` are TypeScript under a `strict`
tsconfig. React types resolve to Preact's via a `paths` remap of
`react`/`react-dom`/`react/jsx-runtime` onto `preact/compat`, so imports stay
written as `react`; ambient declarations for svgr `*.svg` imports and
`*.module.scss` live in `types/global.d.ts`. Components and pages contain no
`any`; `lib` has exactly one, on the metric-mapper callback in
`lib/metricsUtils.ts`, where the payload shape genuinely varies per metric.
Shared domain types are in `lib/types.ts`. Three dead files were left as
`.jsx` rather than converted — `components/api/Widget.jsx`,
`components/metrics/Event.jsx`, and `components/metrics/InputContainer.jsx`
(nothing imports them; delete rather than convert). The CommonJS config layer
(`next.config.js`, `lib/imageConfig.js`,
`plugins/next-optimized-classnames.js`, `postcss.config.js`) is deliberately
excluded: Next require()s it at process start, before any transpiler is
loaded.

## 3. Cmd-K style navigation (done)

⌘K / Ctrl-K opens a hand-rolled, zero-dependency command palette
(`components/CommandPalette.tsx`) for jumping to posts, pages, and meet
reports; a search button in the header is the trigger on touch devices. It
searches titles + metadata (not body text) against a build-time index
(`scripts/generate-search-index.ts` → `public/search-index.json`, ~3.6 KB gz,
gitignored) built from the `lib/blogs.ts` getters (so drafts are excluded)
plus a curated page list; the shared item schema lives in
`lib/searchIndex.ts`. Index generation runs in both `npm run build` and
`npm run export`. Bundle cost: +~0.6 KB gz on the shared `_app` chunk (keydown
listener + header button + lazy mount); the palette itself is a ~2.5 KB gz
async chunk, prefetched on first idle and on header-button hover, with the
index fetched once and cached. `next/dynamic` was deliberately avoided — its
loadable runtime added ~1.7 KB gz to `_app`; a small hand-rolled
`import()`-in-effect mount replaced it. Follow-ups worth tracking:

- Tag pages are not in the index (deliberate). If they're added, fix the
  untrimmed-tags bug first: `pages/tag/[tag].tsx` splits `tags` on `","`
  without trimming, so the export contains duplicate `out/tag/ code/`-style
  directories for the three posts with spaces after commas.
- No `description` frontmatter exists, so entries are title + date only; the
  RSS excerpt machinery (`markdownToHtml().excerpt`) is available if palette
  entries ever want subtitles.
