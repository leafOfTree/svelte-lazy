<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { LazyProps } from './types.js';

  let {
    keep = false,
    height = 0,
    offset = 150,
    fadeOption = { delay: 0, duration: 400 },
    resetHeightDelay = 0,
    onload = null,
    placeholder = null,
    class: className = '',
    children,
    ...rest
  }: LazyProps = $props();

  // The height before loading, as the height prop is when it's created
  const initialHeight = getStyleHeight();
  let containerHeight = $state(initialHeight);
  let loaded = $state(false);
  // False while an image in the content is loading
  let contentShow = $state(true);

  // Set by load(): stops checking whether the node is in view
  let stopChecking = () => {};
  // Pending reset of the height, and listeners for the image loading
  let resetTimer: ReturnType<typeof setTimeout> | undefined;
  let imageListeners: AbortController | undefined;

  function load(node: HTMLElement, offset: number) {
    let stop = check(node, offset);
    stopChecking = () => stop();

    return {
      update: (newOffset: number) => {
        if (!loaded || !keep) {
          stop();
          stop = check(node, newOffset);
        }
      },
      destroy: () => {
        stopChecking();
        clearTimeout(resetTimer);
        imageListeners?.abort();
      },
    };
  }

  // Loads the node when it's within offset below the part of the window that
  // its scroll containers show, and unloads it after it leaves. Returns a
  // function to stop
  function check(node: HTMLElement, offset: number) {
    // Only vertical position is checked: content in a horizontal scroll
    // container loads by its vertical position
    const margin = `0px 100000px ${offset}px 100000px`;
    const toggle = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        loadNode(node);
      } else if (!keep) {
        unload();
      }
    };
    if ('scrollMargin' in IntersectionObserver.prototype) {
      // scrollMargin grows each scroll container like rootMargin grows the
      // window, so the offset applies to scroll containers too
      return observe(node, { rootMargin: margin, scrollMargin: margin }, toggle);
    }

    // Without scrollMargin, the offset is lost in scroll containers, so check
    // on scroll there
    const scrollContainers = getScrollContainers(node);
    if (!scrollContainers.length) {
      return observe(node, { rootMargin: margin }, toggle);
    }

    const handler = throttle(() => {
      const { top, bottom } = node.getBoundingClientRect();
      const visible = getVisibleArea(scrollContainers);

      if (top <= visible.bottom + offset && bottom > visible.top) {
        loadNode(node);
      } else if (!keep) {
        unload();
      }
    }, 200);
    document.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    // Also check on mount and layout changes
    const stopObserving = observe(node, {}, handler);
    return () => {
      handler.cancel();
      document.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
      stopObserving();
    };
  }

  // Returns a function to stop. It uses only observe() and unobserve(), for
  // mocks in tests
  function observe(
    node: HTMLElement,
    options: IntersectionObserverInit & { scrollMargin?: string },
    callback: (entry: IntersectionObserverEntry) => void,
  ) {
    const observer = new IntersectionObserver((entries) => {
      // The latest one, if there are a few
      callback(entries[entries.length - 1]);
    }, options);
    observer.observe(node);
    return () => observer.unobserve(node);
  }

  function unload() {
    if (!loaded) {
      return;
    }
    clearTimeout(resetTimer);
    // The content and its image are gone
    imageListeners?.abort();
    contentShow = true;
    setHeight();
    loaded = false;
  }

  function loadNode(node: HTMLElement) {
    if (loaded) {
      return;
    }

    loaded = true;
    // Kept content never unloads, so there is nothing more to check
    if (keep) {
      stopChecking();
    }
    resetHeight(node);
    onload?.(node);
  }

  function getStyleHeight() {
    return typeof height === 'number' ? height + 'px' : height;
  }

  function setHeight() {
    if (height) {
      containerHeight = getStyleHeight();
    }
  }

  function resetHeight(node: HTMLElement) {
    // Wait for remote resources like images to load
    resetTimer = setTimeout(() => {
      if (!isImageLoading(node)) {
        containerHeight = 'auto';
      }
    }, resetHeightDelay);
  }

  // Waits for the first image of the content. Returns whether the height
  // stays fixed for now
  function isImageLoading(node: HTMLElement) {
    const img = node.querySelector('img');
    if (!img) {
      return false;
    }

    if (!img.complete) {
      contentShow = false;
      // Removes both listeners once one of them runs
      const listeners = new AbortController();
      imageListeners = listeners;
      const options = { capture: true, signal: listeners.signal };

      node.addEventListener(
        'load',
        () => {
          contentShow = true;
          containerHeight = 'auto';
          listeners.abort();
        },
        options,
      );

      node.addEventListener(
        'error',
        () => {
          // Show the content with the fixed height
          contentShow = true;
          listeners.abort();
        },
        options,
      );

      return true;
    }

    // A broken image keeps the fixed height
    return img.naturalHeight === 0;
  }

  function getScrollContainers(node: HTMLElement) {
    const containers: HTMLElement[] = [];
    for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
      if (/auto|scroll|overlay/.test(getComputedStyle(el).overflowY)) {
        containers.push(el);
      }
    }
    return containers;
  }

  // The part of the window not clipped by the scroll containers
  function getVisibleArea(containers: HTMLElement[]) {
    let top = 0;
    let bottom = window.innerHeight;
    for (const el of containers) {
      const rect = el.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
    return { top, bottom };
  }

  // Runs func at most once in wait ms, and once more after the last call
  function throttle(func: () => void, wait: number) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = 0;
    const run = () => {
      timer = undefined;
      last = Date.now();
      func();
    };
    const throttled = () => {
      const remaining = wait - (Date.now() - last);
      if (remaining <= 0) {
        clearTimeout(timer);
        run();
      } else if (!timer) {
        timer = setTimeout(run, remaining);
      }
    };
    throttled.cancel = () => {
      clearTimeout(timer);
      timer = undefined;
    };
    return throttled;
  }
</script>

{#snippet placeholderBlock()}
  <div class="svelte-lazy-placeholder">
    {#if typeof placeholder === 'string'}
      <div>{placeholder}</div>
    {:else if placeholder}
      {@render placeholder()}
    {/if}
  </div>
{/snippet}

<div
  {...rest}
  use:load={offset}
  class={'svelte-lazy' + (className ? ' ' + className : '')}
  style:height={containerHeight}
>
  {#if loaded}
    <!-- No fadeOption: no fade, as fade() would use its default duration -->
    <div
      in:fade={fadeOption || { duration: 0 }}
      class="svelte-lazy-content"
      style:display={contentShow ? null : 'none'}
    >
      {@render children?.()}
    </div>
    {#if !contentShow && placeholder}
      {@render placeholderBlock()}
    {/if}
  {:else if placeholder}
    {@render placeholderBlock()}
  {/if}
</div>
