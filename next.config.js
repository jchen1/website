const path = require("path");

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
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
      config.node = {
        fs: "empty",
      };
    }
    // config.resolve.alias["react"] = path.resolve(
    //   __dirname,
    //   "./node_modules",
    //   "react"
    // );
    // config.resolve.alias["react-dom"] = path.resolve(
    //   __dirname,
    //   "./node_modules",
    //   "react-dom"
    // );
    // config.resolve.alias["prop-types"] = path.resolve(
    //   __dirname,
    //   "./node_modules",
    //   "prop-types"
    // );
    // config.resolve.alias["styled-components"] = path.resolve(
    //   __dirname,
    //   "./node_modules",
    //   "styled-components"
    // );

    return config;
  },
};
