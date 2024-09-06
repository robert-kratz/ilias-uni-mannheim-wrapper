const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  // Configuration options
  output: {
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true, // This ensures all paths fall back to index.html
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      // Configuration options
      async: false, // consider setting async to false if you face race conditions
      typescript: {
        configFile: "tsconfig.json",
      },
      logger: {
        infrastructure: "console",
        issues: "console",
        devServer: true,
      },
    }),
  ],
};
