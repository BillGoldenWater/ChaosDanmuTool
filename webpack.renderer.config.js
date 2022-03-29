/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const rules = require("./webpack.rules");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugins = require("./webpack.plugins");

rules.push(
  {
    test: /\.less$/i,
    use: [
      { loader: "style-loader" },
      { loader: "css-loader" },
      {
        loader: "less-loader",
        options: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    ],
  },
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
  }
);

module.exports = {
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
