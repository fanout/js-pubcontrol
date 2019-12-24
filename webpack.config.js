const path = require('path');

module.exports = {
    entry: './esm/main.browser.mjs',
    output: {
        filename: 'pubcontrol.js',
        path: path.resolve(__dirname, 'browser'),
        library: 'PubControl',
        libraryExport: 'default',
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                },
            },
        ],
    },
};
