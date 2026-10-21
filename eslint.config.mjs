import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  // index.js and index.mjs are built by scripts/build.mjs
  { ignores: ['demo/dist/', '.vitest/', 'index.js', 'index.mjs'] },
  js.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte'],
    rules: {
      // Variables used only in the template look unused to ESLint
      'no-useless-assignment': 'off',
    },
  },
];
