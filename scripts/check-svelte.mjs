// Compile the component with the installed Svelte version, to check that it
// still works with older versions (CI installs Svelte 3 and 4).
// Browser tests run with Svelte 5 only, as Vitest needs a recent
// @sveltejs/vite-plugin-svelte.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { compile, VERSION } from 'svelte/compiler';

function svelteFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return svelteFiles(path);
    return path.endsWith('.svelte') ? [path] : [];
  });
}

let failed = false;
for (const file of svelteFiles('src')) {
  try {
    const { warnings } = compile(readFileSync(file, 'utf8'), { filename: file });
    for (const warning of warnings) {
      console.warn(`${file}: ${warning.message}`);
    }
    console.log(`ok ${file}`);
  } catch (err) {
    failed = true;
    console.error(`FAIL ${file}: ${err.message}`);
  }
}
console.log(`Svelte ${VERSION}`);
process.exit(failed ? 1 : 0);
