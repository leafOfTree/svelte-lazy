const svelte = require('rollup-plugin-svelte');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const livereload = require('rollup-plugin-livereload');
const serve = require('rollup-plugin-serve');
const css = require('rollup-plugin-css-only')

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: 'test/auto/main.js',
  output: [{ file: 'test/auto/index.js', format: 'iife', name: 'app' }],
  onwarn(warning, warn) {
    // Expected when testing with different Svelte versions
    if (warning.code === 'CIRCULAR_DEPENDENCY'
      && warning.ids.every(id => id.includes('node_modules'))) return;
    if (warning.code === 'MISSING_EXPORT' && warning.binding === 'mount') return;
    warn(warning);
  },
  plugins: [
    svelte(),
    nodeResolve({ browser: true }),
    css({ output: 'index.css' }), 
    !production && livereload('test'),
    !production &&
      serve({
        open: true,
        contentBase: 'test',
      }),
  ],
};
