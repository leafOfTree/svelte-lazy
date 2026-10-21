// Print a Svelte Playground link with demo/playground/App.svelte, for the
// README:
//   npm run playground-link
// The code is in the link itself, compressed like svelte.dev does, so the
// link needs no account.
import { readFileSync } from 'node:fs';

const contents = readFileSync('demo/playground/App.svelte', 'utf8');
const json = JSON.stringify({
  name: 'svelte-lazy',
  files: [{ type: 'file', name: 'App.svelte', basename: 'App.svelte', contents, text: true }],
  tailwind: false,
});

const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
const hash = Buffer.from(bytes).toString('base64url');
console.log(`https://svelte.dev/playground/untitled#${hash}`);
