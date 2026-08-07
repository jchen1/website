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

## 3. Cmd-K style navigation

Add a command-palette (⌘K) navigation for jumping to posts, pages, and
projects. Needs a search index over markdown content and a keyboard-driven UI
consistent with the site's bundle-size goals.
