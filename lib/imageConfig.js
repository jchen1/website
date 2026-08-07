// Shared image-optimizer settings. Single source of truth for next.config.js
// (`images` config) and for code that builds /_next/image URLs itself
// (components/Image.tsx, lib/remarkPlugins.ts), so nothing depends on Next's
// internal __NEXT_IMAGE_OPTS env var. CommonJS .js because next.config.js
// require()s it before any transpiler is loaded.
const deviceSizes = [320, 640, 720, 1440, 2160];
// Next.js defaults for imageSizes
const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384];
// trailing slash matches the site-wide `trailingSlash: true` setting
const path = "/_next/image/";

module.exports = { deviceSizes, imageSizes, path };
