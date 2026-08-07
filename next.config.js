// The rest of the codebase is TypeScript, but this file and the two local
// helpers it require()s — ./lib/imageConfig and ./plugins/next-optimized-classnames —
// stay CommonJS .js: Next loads its config at process start, before any
// TypeScript transpiler exists.
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
      // @prefresh/core must load before any component module so its preact
      // options hooks see every render; prepending it to main.js does what
      // the plugin's own extra entrypoint can't (Next never loads that chunk)
      const prepend = isServer
        ? ["preact/debug"]
        : ["preact/debug", "@prefresh/core"];
      const entry = config.entry;
      config.entry = () =>
        entry().then(entries => {
          entries[prependToEntry] = prepend.concat(
            entries[prependToEntry] || [],
          );
          return entries;
        });

      if (!isServer) {
        // Fast refresh for Preact: Next's SWC dev transform emits standard
        // react-refresh instrumentation ($RefreshReg$/$RefreshSig$), and
        // @prefresh/webpack provides the runtime that consumes it to
        // hot-swap preact components. Next's own react-refresh runtime
        // plugin is removed so the two don't fight over those globals.
        const PrefreshPlugin = require("@prefresh/webpack");
        const reactRefresh = config.plugins.find(
          p => p.constructor.name === "ReactFreshWebpackPlugin",
        );
        if (reactRefresh) {
          config.plugins.splice(config.plugins.indexOf(reactRefresh), 1);
        }
        config.plugins.unshift(new PrefreshPlugin({ runsInNextJs: true }));
      }
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
    // linting runs in the pre-commit hook (lint-staged); the build-time
    // lint pass is deprecated in Next 15 and removed in Next 16
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
      rule => rule.test instanceof RegExp && rule.test.test(".svg"),
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
