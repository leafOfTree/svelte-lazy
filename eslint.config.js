import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default [
  { ignores: ['demo/dist/', '.vitest/'] },
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
