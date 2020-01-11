import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';

export default {
    input: 'src/main.commonjs.mjs',
    output: {
        file: 'commonjs/index.js',
        format: 'cjs'
    },
    plugins: [
        commonjs(),
        json(),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',　// only transpile our source code
            plugins: [
                '@babel/plugin-proposal-class-properties',
            ],
        }),
    ],
    external: [
        ...builtins,
        'isomorphic-fetch',
        'agentkeepalive',
        'jwt-simple',
    ],
};
