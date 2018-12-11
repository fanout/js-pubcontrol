const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path');
const projectRoot = path.join(__dirname, '../')
const sourceDir = path.join(projectRoot, './src')
module.exports = {
  entry: [
    path.join(sourceDir, './index'),
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(projectRoot, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: path.join(sourceDir, './index.html'),
        to: path.join(projectRoot, './dist/index.html')},
    ])
  ]
};
