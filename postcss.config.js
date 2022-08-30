const plugins = [
  "postcss-flexbugs-fixes",
  [
    "postcss-preset-env",
    {
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
      features: {
        "custom-properties": false,
      },
    },
  ],
];

if (process.env.NODE_ENV === "production" || true) {
  plugins.push(["cssnano", { preset: "default" }]);
}

module.exports = { plugins };
