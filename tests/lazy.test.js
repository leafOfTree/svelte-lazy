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
  const { container, unmount, rerender } = await render(Scroller, props);
  const scroller = container.querySelector('.scroller');
  /** @type {HTMLElement} */
  const lazy = container.querySelector('.svelte-lazy');
  // Scroll so that the top of <Lazy> is `distance` px below the scroller top
  const scrollTo = (distance) => {
    scroller.scrollTop = (props.before ?? 0) - distance;
  };
  return { lazy, scrollTo, unmount, rerender };
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

describe('scroll containers', () => {
  test('does not load below the scroll container on mount', async () => {
    // Below the 300px scroller and the offset, but within the window
    const { lazy } = await setup({ before: 400, offset: 50 });
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();
  });

  test('unloads after scrolling above the scroll container', async () => {
    const { lazy, scrollTo } = await setup({ before: FAR, height: 200, marginTop: 500 });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();

    // 300px above the scroller top, which is 500px down the window: out of
    // the scroller but still in the window
    scrollTo(-300);
    await expect.poll(() => content(lazy)).toBeNull();
  });

  test('ignores scrolling in another container', async () => {
    const { lazy } = await setup({ before: FAR });
    const other = document.createElement('div');
    other.style.cssText = 'height: 5000px; overflow-y: auto';
    other.innerHTML = '<div style="height: 10000px"></div>';
    document.body.append(other);
    // Past the check on mount and the throttle
    await sleep(SETTLE);
    try {
      other.scrollTop = 100;
      await sleep(SETTLE);
      expect(content(lazy)).toBeNull();
    } finally {
      other.remove();
    }
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

describe('props', () => {
  test('updates the class', async () => {
    const { lazy, rerender } = await setup({ before: FAR, class: 'one' });
    await rerender({ before: FAR, class: 'two' });
    expect(lazy.className).toBe('svelte-lazy two');
  });

  test('fades in by default', async () => {
    const { lazy } = await setup({ height: 100 });
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(content(lazy).getAnimations().length).toBeGreaterThan(0);
  });

  test('does not fade in with fadeOption null', async () => {
    const { lazy } = await setup({ height: 100, fadeOption: null });
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(content(lazy).getAnimations()).toEqual([]);
  });

  test('stops checking after loading with keep', async () => {
    const remove = vi.spyOn(document, 'removeEventListener');
    const { lazy, scrollTo } = await setup({ before: FAR, keep: true });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });

  test('keeps the height when unloaded before resetHeightDelay', async () => {
    const { lazy, scrollTo } = await setup({ before: FAR, height: 200, resetHeightDelay: 600 });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();
    await sleep(SETTLE);
    scrollTo(FAR);
    await expect.poll(() => content(lazy)).toBeNull();
    await sleep(600);
    expect(lazy.style.height).toBe('200px');
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

  test('shows the image after unloading while it was loading', async () => {
    const { lazy, scrollTo } = await setup({
      before: FAR,
      height: 200,
      src: '/img/slow.png?unload',
    });
    scrollTo(100);
    await expect.poll(() => content(lazy)?.style.display).toBe('none');
    await sleep(SETTLE);
    scrollTo(FAR);
    await expect.poll(() => content(lazy)).toBeNull();
    // The image is in the cache when it comes back
    await sleep(1500);
    scrollTo(100);
    await expect.poll(() => content(lazy)?.style.display, { timeout: 3000 }).toBe('');
  });

  test('resets the height when the image is loaded', async () => {
    const { lazy } = await setup({ height: 200, src: '/img/ok.png' });
    await expect.poll(() => lazy.style.height).toBe('auto');
  });
});
