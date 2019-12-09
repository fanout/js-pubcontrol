module.exports = {
    presets: [
        [
            "@babel/env", {
                targets: {
                    ie: "11",
                },
            },
        ],
    ],
    plugins: [
        '@babel/plugin-proposal-class-properties',
        [ 'babel-plugin-module-extension', {
            'mjs': '',
        }]
    ],
};