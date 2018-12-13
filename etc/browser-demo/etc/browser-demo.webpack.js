const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');
const projectRoot = path.join(__dirname, '../')
const sourceDir = path.join(projectRoot, './src')

const browserDemoWebpackConfig = {
  entry: [
    path.join(sourceDir, './index'),
  ],
  mode: process.env.NODE_ENV || 'production',
  output: {
    filename: 'main.js',
    path: path.resolve(projectRoot, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(sourceDir, './index.html'),
        to: path.join(projectRoot, './dist/index.html')},
    ])
  ],
  watchOptions: {
    ignored: /node_modules|dist|\.js/g,
  },
};

const browserDemoWebWorkerWebpackConfig = {
  ...browserDemoWebpackConfig,
  entry: [path.join(sourceDir, './webworker')],
  target: "webworker",
  output: {
    ...browserDemoWebpackConfig.output,
    filename: 'pubcontrol-browser-demo.webworker.js'
  }
}

module.exports = [
  browserDemoWebpackConfig,
  browserDemoWebWorkerWebpackConfig,
]
