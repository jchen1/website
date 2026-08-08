const { join, relative } = require("path");
const generateName = require("css-class-generator");

const CSS_LOADER_MATCH = join("loaders", "css-loader", "src", "index.js");

const names = {};
let index = 0;

const getName = key =>
  Object.prototype.hasOwnProperty.call(names, key)
    ? names[key]
    : (names[key] = generateName(index++));

const getKey = ({ rootContext, resourcePath }, name) =>
  `${relative(rootContext, resourcePath).replace(/\\+/g, "/")}#${name}`;

const getLocalIdent = (path, _, name) => getName(getKey(path, name));

const isFontLoaderChain = use =>
  use.some(
    u =>
      u &&
      typeof u.loader === "string" &&
      u.loader.includes("next-font-loader"),
  );

const webpack = (config, { dev }) => {
  if (dev) return config;

  // The name counter above lives in process memory and restarts at zero each
  // build, while webpack's persistent filesystem cache replays css-loader
  // output (generated names included) from prior processes. Mixing the two
  // assigns the same class name to different modules, so persistent caching
  // must stay off; the in-build memory cache is per-process and safe.
  config.cache = { type: "memory" };

  let patched = 0;
  for (const { oneOf } of config.module.rules)
    if (Array.isArray(oneOf))
      for (const { use } of oneOf) {
        if (!Array.isArray(use) || isFontLoaderChain(use)) continue;
        for (const { loader, options } of use)
          if (
            typeof loader === "string" &&
            loader.endsWith(CSS_LOADER_MATCH) &&
            options &&
            typeof options.modules === "object"
          ) {
            options.modules.getLocalIdent = getLocalIdent;
            patched++;
          }
      }
  if (process.env.DEBUG_CLASSNAMES)
    console.error(`[classnames] patched ${patched} css-loader configs`);

  return config;
};

module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack: (webpackConfig, webpackOptions) =>
    webpack(
      typeof nextConfig.webpack === "function"
        ? nextConfig.webpack(webpackConfig, webpackOptions)
        : webpackConfig,
      webpackOptions,
    ),
});
