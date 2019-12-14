const path = require('path');
const webpack = require('webpack');

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
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /esm\/utils\/bufferUtilities\.mjs/,
            './bufferUtilities.browser.mjs'
        ),
    ],
};
