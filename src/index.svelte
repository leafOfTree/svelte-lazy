<div use:load class={rootClass}>
  {#if loaded}
    {#if fadeOption}
      <div 
        in:fade={fadeOption} 
        class={transitionClass}
      >
        <slot>Lazy load content</slot>
      </div>
    {:else}
      <slot>Lazy load content</slot>
    {/if}
  {:else if typeof placeholder === 'string'}
    <div class={placeholderClass}>{placeholder}</div>
  {:else if typeof placeholder === 'function'}
    <svelte:component this={placeholder} />
  {/if}
</div>
<script>
  import { fade } from 'svelte/transition';
  export let height = 0;
  export let offset = 150;
  export let fadeOption = {
    delay: 0,
    duration: 400, 
  };
  export let resetHeightDelay = 0;
  export let onload = null;
  export let placeholder = null;
  let className = '';
  export { className as class };

  let rootClass = 'svelte-lazy' 
    + (className ? ' ' + className : '');
  const transitionClass = 'svelte-lazy-transition'
  const placeholderClass = 'placeholder'
  let loaded = false;

  function load(node) {
    setHeight(node);

    const loadHandler = throttle(e => {
      const top = node.getBoundingClientRect().top;
      const expectedTop = getExpectedTop(e, offset);

      if (top <= expectedTop) {
        loaded = true;
        resetHeight(node);
        onload && onload(node);
        removeListeners();
      }
    }, 200);

    loadHandler();
    addListeners();

    function addListeners() {
      document.addEventListener('scroll', loadHandler, true);
      window.addEventListener('resize', loadHandler);
    }

    function removeListeners() {
      document.removeEventListener('scroll', loadHandler, true);
      window.removeEventListener('resize', loadHandler);
    }

    return {
      destroy: () => {
        removeListeners();
      },
    };
  }

  function setHeight(node) {
    if (height) {
      node.style.height = (typeof height === 'number') 
        ? height + 'px' 
        : height;
    }
  }

  function resetHeight(node) {
    // Add delay for remote resources like images to load
    setTimeout(() => {
      const img = node.querySelector('img');
      if (img && !img.complete) {
        node.addEventListener('load', () => {
          node.style.height = 'auto';
        }, { capture: true, once: true });
      } else {
        node.style.height = 'auto';
      }
    }, resetHeightDelay);
  }

  function getExpectedTop(e, offset) {
    const height = getContainerHeight(e);
    return height + offset;
  }

  function getContainerHeight(e) {
    if (e && e.target && e.target.getBoundingClientRect) {
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
