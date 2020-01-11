import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';

export default {
    input: 'esm/main.commonjs.mjs',
    output: {
        file: 'commonjs/index.js',
        format: 'cjs'
    },
    plugins: [
        commonjs(),
        json(),
        nodeResolve({
            preferBuiltins: true,
        }),
        babel({
            babelrc: false,
            exclude: 'node_modules/**',　// only transpile our source code
            plugins: [
                '@babel/plugin-proposal-class-properties',
            ],
        }),
    ],
    external: builtins,
};
