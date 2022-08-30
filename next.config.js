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
    swcMinify: true,
    experimental: {
      esmExternals: false,
    },
    webpack: (config, options) => {
      if (options.isServer) {
        config.externals = [
          "react",
          "react-dom",
          "styled-components",
          ...config.externals,
        ];
      } else {
        config.resolve = {
          ...config.resolve,
          fallback: {
            fs: false,
            path: false,
          },
        };
      }

      // SVGs
      const fileLoaderRule = config.module.rules.find(
        rule => rule.test && rule.test.test(".svg")
      );
      fileLoaderRule.exclude = /\.svg$/;
      config.module.rules.push({
        test: /\.svg$/,
        loader: require.resolve("@svgr/webpack"),
      });

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
