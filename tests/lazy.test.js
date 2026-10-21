import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Scroller from './fixtures/Scroller.svelte';
import Nested from './fixtures/Nested.svelte';
import SnippetPlaceholder from './fixtures/SnippetPlaceholder.svelte';

// <Lazy> is placed 2000px down a 300px high scroller, out of the viewport and
// the default offset, so it loads only after scrolling
const FAR = 2000;
// Longer than the 200ms throttle of the scroll handler, used by browsers
// without the scrollMargin option of IntersectionObserver
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

  test('renders a snippet placeholder', async () => {
    const { container } = await render(SnippetPlaceholder, { height: 200 });
    const lazy = container.querySelector('.svelte-lazy');
    expect(placeholder(lazy).querySelector('.custom-placeholder').textContent).toBe(
      'Loading images',
    );
    expect(content(lazy)).toBeNull();

    lazy.scrollIntoView();
    await expect.poll(() => content(lazy)?.textContent.trim()).toBe('Loaded content');
    expect(placeholder(lazy)).toBeNull();
  });

  test('passes other attributes to the container', async () => {
    const { lazy } = await setup({
      before: FAR,
      height: 200,
      'data-id': 'photo',
      'aria-label': 'Photo',
      style: 'color: red',
    });
    expect(lazy.dataset.id).toBe('photo');
    expect(lazy.getAttribute('aria-label')).toBe('Photo');
    expect(lazy.style.color).toBe('red');
    expect(lazy.style.height).toBe('200px');
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

// Browsers without scrollMargin, like Safari before 26, check on scroll
function withoutScrollMargin() {
  /** @type {any} */
  const proto = IntersectionObserver.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'scrollMargin');
  beforeEach(() => {
    delete proto.scrollMargin;
  });
  afterEach(() => {
    Object.defineProperty(proto, 'scrollMargin', descriptor);
  });
}

describe.each([
  ['with scrollMargin', () => {}],
  ['without scrollMargin', withoutScrollMargin],
])('scroll containers %s', (_, setupBrowser) => {
  setupBrowser();

  test('does not load below the scroll container on mount', async () => {
    // Below the 300px scroller and the offset, but within the window
    const { lazy } = await setup({ before: 400, offset: 50 });
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();
  });

  test('loads within offset below the scroll container', async () => {
    const { lazy } = await setup({ before: 400, offset: 150 });
    await expect.poll(() => content(lazy)).not.toBeNull();
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

  test('loads by the vertical position in a horizontal scroll container', async () => {
    const { container } = await render(Scroller, { before: 0 });
    /** @type {HTMLElement} */
    const lazy = container.querySelector('.svelte-lazy');
    const row = document.createElement('div');
    row.style.cssText = 'overflow-x: auto; white-space: nowrap';
    row.innerHTML = '<div style="display: inline-block; width: 5000px"></div>';
    lazy.style.display = 'inline-block';
    lazy.before(row);
    row.append(lazy);
    await expect.poll(() => content(lazy)).not.toBeNull();
  });

  test('loads in nested scroll containers when both show it', async () => {
    const { container } = await render(Nested, { before: FAR, height: 100, offset: 50 });
    const outer = container.querySelector('.outer');
    /** @type {HTMLElement} */
    const lazy = container.querySelector('.svelte-lazy');
    // In view of the inner scroller, which is out of view of the outer one
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();

    // The inner scroller is 400px below the top of the outer one: out of the
    // outer scroller and the offset
    outer.scrollTop = FAR - 400;
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();

    // 340px below: within the offset
    outer.scrollTop = FAR - 340;
    await expect.poll(() => content(lazy)).not.toBeNull();

    outer.scrollTop = 0;
    await expect.poll(() => content(lazy)).toBeNull();
  });
});

describe('layout changes', () => {
  test('loads when moved into view', async () => {
    const { lazy, rerender } = await setup({ before: FAR, height: 200 });
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();
    await rerender({ before: 0, height: 200 });
    await expect.poll(() => content(lazy)).not.toBeNull();
  });

  test('unloads when moved out of view', async () => {
    const { lazy, rerender } = await setup({ before: 0, height: 200 });
    await expect.poll(() => content(lazy)).not.toBeNull();
    await rerender({ before: FAR, height: 200 });
    await expect.poll(() => content(lazy)).toBeNull();
  });

  test('unloads when hidden', async () => {
    const { lazy } = await setup({ before: 0, height: 200 });
    await expect.poll(() => content(lazy)).not.toBeNull();
    lazy.parentElement.style.display = 'none';
    await expect.poll(() => content(lazy)).toBeNull();
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

  test('stops observing when destroyed', async () => {
    const unobserve = vi.spyOn(IntersectionObserver.prototype, 'unobserve');
    const { lazy, unmount } = await setup({ before: FAR });
    await unmount();
    expect(unobserve).toHaveBeenCalledWith(lazy);
  });

  test('does not listen to scroll', async () => {
    const add = vi.spyOn(document, 'addEventListener');
    await setup({ before: FAR });
    await sleep(SETTLE);
    expect(add).not.toHaveBeenCalledWith('scroll', expect.anything(), expect.anything());
  });
});

describe('props', () => {
  test('keeps the height when the style changes', async () => {
    const { lazy, scrollTo, rerender } = await setup({ before: FAR, height: 200, style: '' });
    scrollTo(100);
    await expect.poll(() => lazy.style.height).toBe('auto');
    await rerender({ before: FAR, height: 200, style: 'color: red' });
    expect(lazy.style.color).toBe('red');
    expect(lazy.style.height).toBe('auto');
  });

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
    const unobserve = vi.spyOn(IntersectionObserver.prototype, 'unobserve');
    const { lazy, scrollTo } = await setup({ before: FAR, keep: true });
    scrollTo(100);
    await expect.poll(() => content(lazy)).not.toBeNull();
    expect(unobserve).toHaveBeenCalledWith(lazy);
  });

  test('uses a new offset', async () => {
    const { lazy, scrollTo, rerender } = await setup({ before: FAR, offset: 0 });
    scrollTo(400);
    await sleep(SETTLE);
    expect(content(lazy)).toBeNull();
    await rerender({ before: FAR, offset: 150 });
    await expect.poll(() => content(lazy)).not.toBeNull();
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
