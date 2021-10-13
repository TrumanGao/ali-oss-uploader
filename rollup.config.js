import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import pkg from './package.json';

export default {
    input: "./src/index.js",
    output: [
        {
            format: "cjs",
            file: pkg.main
        },
        {
            format: "es",
            file: pkg.module
        }
    ],
    plugins: [
        resolve({ preferBuiltins: false }),
        commonjs(),
        json()
    ]
};
