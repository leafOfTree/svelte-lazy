const svelte = require('rollup-plugin-svelte');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const livereload = require('rollup-plugin-livereload');
const serve = require('rollup-plugin-serve');
const css = require('rollup-plugin-css-only')

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'test/main.js',
  output: [
    { file: 'test/index.js', format: 'iife', name: 'app' },
  ],
  plugins: [
    svelte(),
    nodeResolve({ browser: true }),
    css({ output: 'index.css' }), 
    !production && livereload('test'),
    !production && serve({
      open: true, 
      contentBase: 'test',
    }),
  ],
};
