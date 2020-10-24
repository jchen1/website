const path = require("path");

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  trailingSlash: true,
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
};
