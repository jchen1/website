# Triage

Backlog of larger maintenance / improvement projects.

## 1. Modernize dependencies (done — see jchen1/deps-modernization)

Upgraded to Next 15.5 (pages router, webpack) + preact 10.29 +
styled-components 6 + remark 15/unified 11 + eslint 9 flat config, keeping the
custom bundle-size machinery working. Follow-ups worth tracking:

- **Next 16 is blocked** until the webpack-dependent customizations (preact
  aliasing, css-module class minifier, svgr rule, `__NEXT_IMAGE_OPTS`-free
  image config) get Turbopack equivalents — or get dropped.
- Dev fast-refresh is gone (@prefresh/next only supports Next <=12); dev falls
  back to full reloads.
- Sass `@import` is deprecated (silenced in next.config.js); migrating
  `styles/` to `@use`/`@forward` needs `sass-migrator` plus handling the
  `$inter-font-*` top-level vars in main.scss.
- Still unmaintained, pinned, and working: react-hooks-global-state 1.x,
  confetti-js, rss, gray-matter, css-class-generator, moment (maintenance
  mode), crypto-js (registry-deprecated).

## 2. Convert fully to TypeScript

Migrate the codebase (components, lib, pages, scripts) from JS/JSX to
TypeScript. `lib/placement.ts` already exists; add a `tsconfig.json`, convert
incrementally, and type the markdown/frontmatter pipeline.

## 3. Cmd-K style navigation

Add a command-palette (⌘K) navigation for jumping to posts, pages, and
projects. Needs a search index over markdown content and a keyboard-driven UI
consistent with the site's bundle-size goals.
