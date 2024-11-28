<div use:load class={rootClass} style="height: {rootInitialHeight}">
  {#if loaded}
    <div
      in:fade={fadeOption || {}}
      class={contentClass}
      style={contentStyle}
    >
      {#if children}
        {@render children()}
      {:else}
        Lazy load content
      {/if}
    </div>
    {#if !contentShow && placeholder}
      <Placeholder {placeholder} {placeholderProps} />
    {/if}
  {:else if placeholder}
    <Placeholder {placeholder} {placeholderProps} />
  {/if}
</div>

<script>
  import { fade } from 'svelte/transition';
  import Placeholder from './components/Placeholder.svelte';
  /**
   * @typedef {Object} Props
   * @property {boolean} [keep]
   * @property {number} [height]
   * @property {number} [offset]
   * @property {any} [fadeOption]
   * @property {number} [resetHeightDelay]
   * @property {any} [onload]
   * @property {any} [placeholder]
   * @property {any} [placeholderProps]
   * @property {string} [class]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let {
    keep = false,
    height = 0,
    offset = 150,
    fadeOption = {
    delay: 0,
    duration: 400,
  },
    resetHeightDelay = 0,
    onload = null,
    placeholder = null,
    placeholderProps = null,
    class: className = '',
    children
  } = $props();
  

  const rootClass = 'svelte-lazy'
    + (className ? ' ' + className : '');
  const contentClass = 'svelte-lazy-content';
  const rootInitialHeight = getStyleHeight();
  let loaded = $state(false);

  let contentShow = $state(true);
  let contentStyle = $derived(!contentShow ? 'display: none' : '');

  function load(node) {
    setHeight(node);
    const handler = createHandler(node);
    addListeners(handler);
    setTimeout(() => {
      handler();
    });
    const observer = observeNode(node, handler);

    return {
      destroy: () => {
        removeListeners(handler);
        observer.unobserve(node);
      },
    };
  }

  function createHandler(node) {
    const handler = throttle(e => {
      const nodeTop = node.getBoundingClientRect().top;
      const nodeBottom = node.getBoundingClientRect().bottom;
      const expectedTop = getContainerHeight(e) + offset;

      if (nodeTop <= expectedTop && nodeBottom > 0) {
        loadNode(node);
      } else if (!keep) {
        unload(node)
      }
    }, 200);
    return handler;
  }

  function observeNode(node, handler) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadNode(node);
      }
    })
    observer.observe(node);
    return observer;
  }

  function unload(node) {
    setHeight(node);
    loaded = false
  }

  function loadNode(node, handler) {
    if (loaded) {
      return;
    }

    loaded = true;
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
    return (typeof height === 'number')
      ? height + 'px'
      : height;
  }

  function setHeight(node) {
    if (height) {
      node.style.height = getStyleHeight();
    }
  }

  function resetHeight(node) {
    setTimeout(() => {
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
      return false
    }

    if (!img.complete) {
      contentShow = false;

      node.addEventListener('load', () => {
        // Use auto height if loading successfully
        contentShow = true;
        node.style.height = 'auto';
      }, { capture: true, once: true });

      node.addEventListener('error', () => {
        // Show content with fixed height if there is error
        contentShow = true;
      }, { capture: true, once: true });

      return true;
    }

    if (img.naturalHeight === 0) {
      // Use fixed height if img has zero height
      return true;
    }

    return false;
  }

  function getContainerHeight(e) {
    if (e?.target?.getBoundingClientRect) {
      return e.target.getBoundingClientRect().bottom;
    } else {
      return window.innerHeight;
    }
  }

  // From underscore souce code
  function throttle(func, wait, options) {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    if (!options) options = {};
    const later = function() {
      previous = options.leading === false ? 0 : new Date();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    return function(event) {
      const now = new Date();
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
  }
</script>
