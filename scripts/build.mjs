// Build index.js (UMD) and index.mjs (ES) for tools that don't compile
// .svelte files, like Jest 27 or webpack 4 without the svelte main field:
//   npm run build
// As in 1.3.0 and before, they're compiled by Svelte 4 with its runtime
// inside. Bundlers that read the svelte condition use src/index.svelte.
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { compile } from 'svelte4/compiler';

// Compile .svelte files and resolve `svelte/...` imports by Svelte 4, which
// is installed as svelte4 next to Svelte 5
function svelte4() {
  return {
    name: 'svelte4',
    resolveId(id, importer) {
      if (id === 'svelte' || id.startsWith('svelte/')) {
        return this.resolve(id.replace(/^svelte/, 'svelte4'), importer, { skipSelf: true });
      }
      return null;
    },
    transform(code, id) {
      if (!id.endsWith('.svelte')) {
        return null;
      }
      const { js, warnings } = compile(code, { filename: id, css: 'injected' });
      for (const warning of warnings) {
        this.warn(warning.message);
      }
      return js;
    },
  };
}

const bundle = await rollup({
  input: 'src/index.svelte',
  plugins: [svelte4(), nodeResolve({ browser: true })],
});
// Generated code isn't type checked
const banner = '// Built by scripts/build.mjs from src/index.svelte\n// @ts-nocheck';
await bundle.write({ file: 'index.mjs', format: 'es', banner });
await bundle.write({ file: 'index.js', format: 'umd', name: 'Lazy', banner });
await bundle.close();
console.log('Built index.js and index.mjs');
