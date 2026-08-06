// Shared image-optimizer settings. Single source of truth for next.config.js
// (`images` config) and for code that builds /_next/image URLs itself
// (components/Image.jsx, lib/remarkPlugins.js), so nothing depends on Next's
// internal __NEXT_IMAGE_OPTS env var.
const deviceSizes = [320, 640, 720, 1440, 2160];
// Next.js defaults for imageSizes
const imageSizes = [16, 32, 48, 64, 96, 128, 256, 384];
// trailing slash matches the site-wide `trailingSlash: true` setting
const path = "/_next/image/";

module.exports = { deviceSizes, imageSizes, path };
