import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import css from "rollup-plugin-import-css";

export default [{
    input: "src/index.js",
    output: {
        file: "public/game.js",
        format: "esm",
        sourcemap: true,
    },
    plugins: [
        css({
            output: 'ui.css',
            minify: true
        }),
        nodeResolve({
            extensions: [".js"],
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        babel({
            presets: ["@babel/preset-react"],
            compact: true
        }),
        commonjs()
    ]
}, {
    input: 'server/core.js',
    output: {
        file: 'server.js',
        format: 'cjs'
    }
}]