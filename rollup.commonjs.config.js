import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import builtins from 'builtin-modules';
import typescript from '@rollup/plugin-typescript';

export default {
    input: 'src/main.commonjs.ts',
    output: {
        file: 'commonjs/index.js',
        format: 'cjs'
    },
    plugins: [
        commonjs(),
        json(),
        typescript({lib: ["es5", "dom"], esModuleInterop: true, target: "es5"}),
    ],
    external: [
        ...builtins,
        'isomorphic-fetch',
        'agentkeepalive',
        'jwt-simple',
    ],
};
