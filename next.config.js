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
    async headers() {
      return [
        {
          // matching all static files
          source: "/static/(.*)",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            { key: "Access-Control-Allow-Origin", value: "*" },
            {
              key: "Access-Control-Allow-Methods",
              value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
            },
            {
              key: "Access-Control-Allow-Headers",
              value:
                "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
            },
          ],
        },
      ];
    },
  })
);
