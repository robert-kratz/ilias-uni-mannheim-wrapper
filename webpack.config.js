module.exports = {
  // Configuration options
  output: {
    publicPath: "/",
  },
  devServer: {
    historyApiFallback: true, // This ensures all paths fall back to index.html
  },
};
