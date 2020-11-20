const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  trailingSlash: true,
  crossOrigin: "anonymous",
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
});
