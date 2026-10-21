<script>
  import { fade } from 'svelte/transition';
  import Placeholder from './components/Placeholder.svelte';
  export let keep = false;
  export let height = 0;
  export let offset = 150;
  export let fadeOption = {
    delay: 0,
    duration: 400,
  };
  export let resetHeightDelay = 0;
  export let onload = null;
  export let placeholder = null;
  export let placeholderProps = null;
  export let id = undefined;
  let className = '';
  export { className as class };

  $: rootClass = 'svelte-lazy' + (className ? ' ' + className : '');
  const contentClass = 'svelte-lazy-content';
  const rootInitialHeight = getStyleHeight();
  let loaded = false;

  let contentShow = true;
  $: contentStyle = !contentShow ? 'display: none' : '';

  // Set by load(): stops checking whether the node is in view
  let stopChecking = () => {};
  // Pending reset of the height, and listeners for the image loading
  let resetTimer;
  let imageListeners;

  function load(node, offset) {
    setHeight(node);
    let stop = check(node, offset);
    stopChecking = () => stop();

    return {
      update: (newOffset) => {
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
  function check(node, offset) {
    // Only vertical position is checked, as in 1.4 and before: content in a
    // horizontal scroll container loads by its vertical position
    const margin = `0px 100000px ${offset}px 100000px`;
    const toggle = (entry) => {
      if (entry.isIntersecting) {
        loadNode(node);
      } else if (!keep) {
        unload(node);
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
        unload(node);
      }
    }, 200);
    addListeners(handler);
    // Also check on mount and layout changes
    const stopObserving = observe(node, {}, handler);
    return () => {
      handler.cancel();
      removeListeners(handler);
      stopObserving();
    };
  }

  // Returns a function to stop. It uses only observe() and unobserve(), as
  // 1.2 did, for mocks in tests
  function observe(node, options, callback) {
    const observer = new IntersectionObserver((entries) => {
      // The latest one, if there are a few
      callback(entries[entries.length - 1]);
    }, options);
    observer.observe(node);
    return () => observer.unobserve(node);
  }

  function unload(node) {
    // Writing the height of every unloaded node on each scroll would make the
    // browser lay out the page again for each of them
    if (!loaded) {
      return;
    }
    clearTimeout(resetTimer);
    // The content and its image are gone
    imageListeners?.abort();
    contentShow = true;
    setHeight(node);
    loaded = false;
  }

  function loadNode(node) {
    if (loaded) {
      return;
    }

    loaded = true;
    // Kept content never unloads, so there is nothing more to check
    if (keep) {
      stopChecking();
    }
    resetHeight(node);
    if (onload) {
      onload(node);
    }
  }

  function addListeners(handler) {
    document.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
  }

  function removeListeners(handler) {
    document.removeEventListener('scroll', handler, true);
    window.removeEventListener('resize', handler);
  }

  function getStyleHeight() {
    return typeof height === 'number' ? height + 'px' : height;
  }

  function setHeight(node) {
    if (height) {
      node.style.height = getStyleHeight();
    }
  }

  function resetHeight(node) {
    resetTimer = setTimeout(() => {
      const isLoading = checkImgLoadingStatus(node);
      if (!isLoading) {
        node.style.height = 'auto';
      }
      // Add a delay to wait for remote resources like images to load
    }, resetHeightDelay);
  }

  function checkImgLoadingStatus(node) {
    const img = node.querySelector('img');
    if (!img) {
      return false;
    }

    if (!img.complete) {
      contentShow = false;
      // Removes both listeners once one of them runs
      imageListeners = new AbortController();
      const options = { capture: true, signal: imageListeners.signal };

      node.addEventListener(
        'load',
        () => {
          // Use auto height if loading successfully
          contentShow = true;
          node.style.height = 'auto';
          imageListeners.abort();
        },
        options,
      );

      node.addEventListener(
        'error',
        () => {
          // Show content with fixed height if there is error
          contentShow = true;
          imageListeners.abort();
        },
        options,
      );

      return true;
    }

    if (img.naturalHeight === 0) {
      // Use fixed height if img has zero height
      return true;
    }

    return false;
  }

  function getScrollContainers(node) {
    const containers = [];
    for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
      if (/auto|scroll|overlay/.test(getComputedStyle(el).overflowY)) {
        containers.push(el);
      }
    }
    return containers;
  }

  // The part of the window not clipped by the scroll containers
  function getVisibleArea(containers) {
    let top = 0;
    let bottom = window.innerHeight;
    for (const el of containers) {
      const rect = el.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
    return { top, bottom };
  }

  // From the underscore source code
  function throttle(func, wait, options) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    if (!options) options = {};
    const later = function () {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    const throttled = function () {
      const now = Date.now();
      if (!previous && options.leading === false) previous = now;
      const remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
    throttled.cancel = function () {
      clearTimeout(timeout);
      timeout = null;
      context = args = null;
    };
    return throttled;
  }
</script>

<div use:load={offset} {id} class={rootClass} style="height: {rootInitialHeight}">
  {#if loaded}
    <!-- No fadeOption: no fade, as fade() would use its default duration -->
    <div in:fade={fadeOption || { duration: 0 }} class={contentClass} style={contentStyle}>
      <slot>Lazy load content</slot>
    </div>
    {#if !contentShow && placeholder}
      <Placeholder {placeholder} {placeholderProps} />
    {/if}
  {:else if placeholder}
    <Placeholder {placeholder} {placeholderProps} />
  {/if}
</div>
