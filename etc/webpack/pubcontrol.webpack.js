const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');
const projectRoot = path.join(__dirname, '../../')
const sourceDir = path.join(projectRoot, './lib')
const package = require('../../package.json')
module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: path.resolve(projectRoot, package.main),
  output: {
    filename: 'main.js',
    path: path.resolve(projectRoot, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(projectRoot, './etc/webpack/index.html'),
        to: path.join(projectRoot, './dist/index.html')},
    ])
  ],
};
