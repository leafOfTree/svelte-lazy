import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Strips the TypeScript in src/ when packaging, so dist/ is JavaScript
export default {
  preprocess: vitePreprocess({ script: true }),
};
