const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPreact = require("next-plugin-preact");

module.exports = withPreact(
  withBundleAnalyzer({
    sassOptions: {
      includePaths: [path.join(__dirname, "styles")],
    },
    trailingSlash: true,
    crossOrigin: "anonymous",
    images: {
      deviceSizes: [320, 640, 720, 1440, 2160],
    },
    webpack: (config, options) => {
      if (options.isServer) {
        config.externals = [
          "react",
          "react-dom",
          "styled-components",
          ...config.externals,
        ];

        require("./scripts/generate-feeds");
      } else {
        config.node = {
          fs: "empty",
        };
      }

      return config;
    },
  })
);
