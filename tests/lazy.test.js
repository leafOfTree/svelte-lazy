import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Scroller from './fixtures/Scroller.svelte';
import Placeholder from './fixtures/Placeholder.svelte';

// <Lazy> is placed 2000px down a 300px high scroller, out of the viewport and
// the default offset, so it loads only after scrolling
const FAR = 2000;
// Longer than the 200ms throttle of the scroll handler
const SETTLE = 400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function setup(props) {
  const { container, unmount } = await render(Scroller, props);
  const scroller = container.querySelector('.scroller');
  /** @type {HTMLElement} */
  const lazy = container.querySelector('.svelte-lazy');
  // Scroll so that the top of <Lazy> is `distance` px below the scroller top
  const scrollTo = (distance) => {
    scroller.scrollTop = (props.before ?? 0) - distance;
  };
  return { lazy, scrollTo, unmount };
}

/** @type {(lazy: HTMLElement) => HTMLElement | null} */
const content = (lazy) => lazy.querySelector('.svelte-lazy-content');
const placeholder = (lazy) => lazy.querySelector('.svelte-lazy-placeholder');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('before load', () => {
  test('renders the container with height, class, id and placeholder', async () => {
    const { lazy } = await setup({
      before: FAR,
      height: 200,
      class: 'extra',
      id: 'anchor',
      placeholder: 'Loading...',
    });
    expect(lazy.className).toBe('svelte-lazy extra');
    expect(lazy.id).toBe('anchor');
    expect(lazy.style.height).toBe('200px');
    expect(placeholder(lazy).textContent).toBe('Loading...');
    expect(content(lazy)).toBeNull();
  });

  test('has no id attribute by default', async () => {
    const { lazy } = await setup({ before: FAR });
    expect(lazy.hasAttribute('id')).toBe(false);
  });

  test('accepts a CSS height', async () => {
    const { lazy } = await setup({ before: FAR, height: '10rem' });
    expect(lazy.style.height).toBe('10rem');
  });

  test('renders a component placeholder with placeholderProps', async () => {
    const { lazy } = await setup({
      before: FAR,
      placeholder: Placeholder,
      placeholderProps: { name: 'images' },
    });
    expect(lazy.querySelector('.custom-placeholder').textContent).toBe('Loading images');
  });

  test('renders no placeholder element without placeholder', async () => {
    const { lazy } = await setup({ before: FAR });
    expect(placeholder(lazy)).toBeNull();
  });
});

describe('loading', () => {
  test('loads content in view on mount', async () => {
    const { lazy } = await setup({ height: 200, placeholder: 'Loading...' });
    await expect.poll(() => content(lazy)?.textContent).toBe('Loaded content');
    await expect.poll(() => lazy.style.height).toBe('auto');
    expect(placeholder(lazy)).toBeNull();
  });

  test('loads when scrolled within offset', async () => {
    const onload = vi.fn();
    const { lazy, scrollTo } = await setup({ before: FAR, height: 200, offset: 150, onload });
    // Let the check on mount run first. Throttled after a scroll, it would
    // run without the scroll event and compare with the window height
    await sleep(SETTLE);

    // 300px scroller + 150px offset: 500px below is outside
    scrollTo(500);
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();

    // 400px below is not visible yet, but within offset
    scrollTo(400);
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(onload).toHaveBeenCalledWith(lazy);
  });

  test('calls onload once while loaded', async () => {
    const onload = vi.fn();
    const { lazy, scrollTo } = await setup({ before: FAR, onload });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();
    for (const distance of [90, 80, 70]) {
      scrollTo(distance);
      await sleep(SETTLE);
    }
    expect(onload).toHaveBeenCalledTimes(1);
  });

  test('loads when scrolled to its id', async () => {
    const { lazy } = await setup({ before: FAR, id: 'anchor' });
    document.getElementById('anchor').scrollIntoView();
    await expect.poll(() => content(lazy)).not.toBeNull();
  });

  test('resets height after resetHeightDelay', async () => {
    const { lazy } = await setup({ height: 200, resetHeightDelay: 500 });
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(lazy.style.height).toBe('200px');
    await expect.poll(() => lazy.style.height).toBe('auto');
  });
});

describe('unloading', () => {
  test('unloads after leaving the viewport', async () => {
    const { lazy, scrollTo } = await setup({
      before: FAR,
      height: 200,
      placeholder: 'Loading...',
    });
    scrollTo(100);
    await expect.poll(() => lazy.style.height).toBe('auto');

    scrollTo(FAR);
    await expect.poll(() => content(lazy)).toBeNull();
    expect(placeholder(lazy).textContent).toBe('Loading...');
    expect(lazy.style.height).toBe('200px');
  });

  test('keeps loaded content with keep', async () => {
    const { lazy, scrollTo } = await setup({ before: FAR, keep: true });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();

    scrollTo(FAR);
    await sleep(SETTLE);
    expect(content(lazy)).not.toBeNull();
  });

  test('removes listeners when destroyed', async () => {
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const { unmount } = await setup({ before: FAR });
    await unmount();
    expect(removeDocument).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    expect(removeWindow).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

describe('images', () => {
  test('keeps the height when the image fails to load', async () => {
    const { lazy } = await setup({ height: 200, src: '/img/missing.png' });
    await expect.poll(() => content(lazy)).not.toBeNull();
    await sleep(SETTLE);
    expect(lazy.style.height).toBe('200px');
  });

  test('shows the placeholder until the image loads', async () => {
    const { lazy } = await setup({
      height: 200,
      placeholder: 'Loading...',
      src: '/img/slow.png',
    });
    await expect.poll(() => content(lazy)?.style.display).toBe('none');
    expect(placeholder(lazy)).not.toBeNull();
    expect(lazy.style.height).toBe('200px');

    await expect.poll(() => content(lazy).style.display, { timeout: 3000 }).toBe('');
    expect(placeholder(lazy)).toBeNull();
    expect(lazy.style.height).toBe('auto');
  });

  test('resets the height when the image is loaded', async () => {
    const { lazy } = await setup({ height: 200, src: '/img/ok.png' });
    await expect.poll(() => lazy.style.height).toBe('auto');
  });
});
