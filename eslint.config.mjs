import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default ts.config(
  // dist/ and .svelte-kit/ are made by svelte-package
  { ignores: ['demo/dist/', '.vitest/', 'dist/', '.svelte-kit/'] },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
    rules: {
      // Variables used only in the template look unused to ESLint
      'no-useless-assignment': 'off',
      // TypeScript checks it, and knows DOM types like IntersectionObserverInit
      'no-undef': 'off',
    },
  },
);
