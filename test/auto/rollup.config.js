import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'test/auto/main.js',
  output: [
    { file: 'test/auto/index.js', format: 'iife', name: 'app' },
  ],
  plugins: [
    svelte(),
    resolve({ browser: true }),
    !production && livereload('test'),
    !production && serve({
      open: true, 
      contentBase: 'test',
    }),
  ],
};
