// The prebuilt index.mjs, compiled by Svelte 4 with its runtime inside, for
// tools that don't compile .svelte files. `npm test` builds it first
import { expect, test } from 'vitest';
import Lazy from '../index.mjs';

test('the prebuilt component loads in view', async () => {
  const target = document.createElement('div');
  document.body.append(target);
  const lazy = new Lazy({ target, props: { height: 100, placeholder: 'Loading...' } });
  try {
    /** @type {HTMLElement} */
    const node = target.querySelector('.svelte-lazy');
    expect(node.style.height).toBe('100px');
    // In view at the top of the page, it loads the default content
    await expect.poll(() => node.textContent.trim()).toBe('Lazy load content');
  } finally {
    lazy.$destroy();
    target.remove();
  }
});
