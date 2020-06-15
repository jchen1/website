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

    return config;
  },
};
