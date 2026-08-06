const path = require("path");
const moduleAlias = require("module-alias");
const imageConfig = require("./lib/imageConfig");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// react/react-dom already resolve to @preact/compat via package.json npm
// aliases; redirecting Node-side resolution to preact's own compat entry as
// well guarantees a single copy of the compat layer (and of preact's hook
// state) no matter which specifier a package uses.
moduleAlias.addAliases({
  react: "preact/compat",
  "react-dom": "preact/compat",
  "react-ssr-prepass": "preact-ssr-prepass",
  webpack: "webpack",
});

// must load after the module aliases are registered
const withPrefresh = require("@prefresh/next");
const withNextOptimizedClassnames = require("./plugins/next-optimized-classnames");

// Runs the app on Preact: aliases React to preact/compat in the bundle, keeps
// preact in its own framework-adjacent cache group, disables webpack's package
// `exports` field resolution on the server so the CJS and ESM builds of preact
// can't both be loaded (hooks rely on a singleton), and wires up @prefresh
// fast refresh plus preact/debug in dev.
const withPreact = (nextConfig = {}) =>
  withPrefresh({
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
      aliases["react-ssr-prepass"] = "preact-ssr-prepass";

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
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  trailingSlash: true,
  crossOrigin: "anonymous",
  images: {
    deviceSizes: imageConfig.deviceSizes,
  },
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
};

module.exports = plugins.reduce((config, plugin) => plugin(config), baseConfig);
