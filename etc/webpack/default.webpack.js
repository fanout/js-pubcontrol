const path = require('path');
const projectRoot = path.join(__dirname, '../../')
module.exports = {
  entry: path.join(projectRoot, './lib/index'),
  output: {
    filename: 'main.js',
    path: path.resolve(projectRoot, 'dist'),
  }
};
