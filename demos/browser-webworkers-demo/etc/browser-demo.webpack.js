const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const projectRoot = path.join(__dirname, "../");
const sourceDir = path.join(projectRoot, "./src");

/**
 * webpack config for main browser-demo entrypoint, which doesn't do much but load the web worker.
 */
const browserDemoWebpackConfig = {
  entry: [path.join(sourceDir, "./index")],
  mode: process.env.NODE_ENV || "production",
  output: {
    filename: "main.js",
    path: path.resolve(projectRoot, "dist")
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(sourceDir, "./index.html"),
        to: path.join(projectRoot, "./dist/index.html")
      }
    ])
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [ "@babel/preset-env", { useBuiltIns: "entry", corejs: 3 } ]
            ],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        }
      }
    ]
  },
  watchOptions: {
    ignored: /node_modules|dist|\.js/g
  },
};

/**
 * webpack config for the web worker bundle
 */
const browserDemoWebWorkerWebpackConfig = {
  ...browserDemoWebpackConfig,
  entry: [path.join(sourceDir, "./webworker")],
  target: "webworker",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [ "@babel/preset-env", { targets: { node: 14, } } ]
            ],
          },
        }
      }
    ]
  },
  output: {
    ...browserDemoWebpackConfig.output,
    filename: "pubcontrol-browser-demo.webworker.js"
  }
};

/**
 * Export a webpack multi-config
 */
module.exports = [browserDemoWebpackConfig, browserDemoWebWorkerWebpackConfig];
