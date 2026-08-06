const path = require("path");
const imageConfig = require("./lib/imageConfig");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withNextOptimizedClassnames = require("./plugins/next-optimized-classnames");

// Runs the app on Preact: aliases React to preact/compat in the bundle, keeps
// preact in its own framework-adjacent cache group, disables webpack's package
// `exports` field resolution on the server so the CJS and ESM builds of preact
// can't both be loaded (hooks rely on a singleton), and injects preact/debug
// in dev.
const withPreact = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
      const { dev, isServer, nextRuntime } = options;

      if (isServer && +options.webpack.version.split(".")[0] >= 5) {
        config.resolve.exportsFields = [];
      }

      const cacheGroups =
        config.optimization &&
        config.optimization.splitChunks &&
        config.optimization.splitChunks.cacheGroups;
      if (cacheGroups && cacheGroups.framework) {
        cacheGroups.preact = {
          ...cacheGroups.framework,
          test: /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/,
        };
      }

      const aliases = config.resolve.alias || (config.resolve.alias = {});
      aliases.react = aliases["react-dom"] = "preact/compat";

      if (dev && nextRuntime !== "edge") {
        const prependToEntry = isServer ? "pages/_document" : "main.js";
        const entry = config.entry;
        config.entry = () =>
          entry().then(entries => {
            entries[prependToEntry] = ["preact/debug"].concat(
              entries[prependToEntry] || []
            );
            return entries;
          });
      }

      if (typeof nextConfig.webpack === "function") {
        config = nextConfig.webpack(config, options);
      }

      return config;
    },
  });

const plugins = [withBundleAnalyzer, withPreact, withNextOptimizedClassnames];
const baseConfig = {
  // static export (replaces `next export`); the default server build keeps
  // headers() and the /_next/image optimizer for Vercel
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
    silenceDeprecations: ["import", "legacy-js-api"],
  },
  trailingSlash: true,
  crossOrigin: "anonymous",
  eslint: {
    // the eslint 9 / eslint-config-next migration is tracked separately;
    // linting runs in the pre-commit hook
    ignoreDuringBuilds: true,
  },
  images: {
    deviceSizes: imageConfig.deviceSizes,
  },
  webpack: (config, options) => {
    if (options.isServer) {
      config.externals = [
        "react",
        "react-dom",
        "styled-components",
        // stateful hook libraries must resolve to the same preact instance
        // as the renderer, so they can't be bundled into server chunks
        "react-hooks-global-state",
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
      rule => rule.test instanceof RegExp && rule.test.test(".svg")
    );
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/;
    }
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
};

module.exports = plugins.reduce((config, plugin) => plugin(config), baseConfig);
