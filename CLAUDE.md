# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start development server on port 4000 (raise the file
  descriptor limit first — e.g. `ulimit -n 65536` — or watchpack hits EMFILE
  and dynamic routes 404)
- `npm run build` - Generate RSS feeds and build for production
- `npm run export` - Static export to `out/` (`output: "export"` via the
  `STATIC_EXPORT` env var; `next export` no longer exists)
- `npm run analyze` - Production build with bundle analysis
- `npm run start` - Start production server

## Linting & Formatting

Pre-commit hooks run automatically via Husky:

- ESLint: `*.{js,jsx,ts,tsx}` files
- Prettier: `*.{js,jsx,ts,tsx,css,md}` files

## Architecture

This is a personal blog/website built with **Next.js 15 (pages router, webpack) using Preact** as the React replacement for smaller bundle size. Next 16 is blocked: it deprecates the webpack config path, which the Preact aliasing, the css-module class-name minifier (`plugins/next-optimized-classnames.js`), and the svgr rule all require.

### Key Directories

- `/pages` - Next.js pages (SSG)
- `/components` - Preact components
- `/lib` - Utilities, hooks, remark plugins, state management
- `/markdown` - Content source (posts, pages, meet-reports)
- `/styles` - Sass stylesheets
- `/scripts` - Build scripts (RSS feed generation, bundle analysis)
- `/plugins` - Custom Next.js plugins

### Configuration Notes

- **Preact**: React/ReactDOM are npm-aliased to `@preact/compat` in package.json (Node-side resolution) and webpack-aliased to `preact/compat` in next.config.js (bundle-side). Packages that call hooks must not be bundled into server chunks (see the server `externals` list in next.config.js) or a second preact instance crashes SSG
- **SVGs**: Imported as React components via `@svgr/webpack`
- **Sass**: Global styles in `/styles`, component path available via `includePaths`
- **Trailing slashes**: Enabled for all routes
