# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

- `npm run dev` - Start development server on port 4000
- `npm run build` - Generate RSS feeds and build for production
- `npm run analyze` - Production build with bundle analysis
- `npm run start` - Start production server

## Linting & Formatting

Pre-commit hooks run automatically via Husky:

- ESLint: `*.{js,jsx,ts,tsx}` files
- Prettier: `*.{js,jsx,ts,tsx,css,md}` files

## Architecture

This is a personal blog/website built with **Next.js 12 using Preact** as the React replacement for smaller bundle size.

### Key Directories

- `/pages` - Next.js pages (SSG)
- `/components` - Preact components
- `/lib` - Utilities, hooks, remark plugins, state management
- `/markdown` - Content source (posts, pages, meet-reports)
- `/styles` - Sass stylesheets
- `/scripts` - Build scripts (RSS feed generation, bundle analysis)
- `/plugins` - Custom Next.js plugins

### Configuration Notes

- **Preact**: React/ReactDOM are aliased to `@preact/compat` in package.json
- **SVGs**: Imported as React components via `@svgr/webpack`
- **Sass**: Global styles in `/styles`, component path available via `includePaths`
- **Trailing slashes**: Enabled for all routes
