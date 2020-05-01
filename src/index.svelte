<div use:load>
  {#if loaded}
    {#if fadeOption}
      <div transition:fade={fadeOption}>
        <slot>Lazy load content</slot>
      </div>
    {:else }
      <div>
        <slot>Lazy load content</slot>
      </div>
    {/if}
  {:else if typeof placeholder === 'string'}
    <div>{placeholder}</div>
  {:else if typeof placeholder === 'function'}
    <svelte:component this={placeholder} />
  {/if}
</div>
<script>
  import { getContext } from 'svelte';
  import { fade } from 'svelte/transition';
  export let height = 0;
  export let offset = 150;
  export let fadeOption = {
    delay: 0,
    duration: 400, 
  };
  export let onload = null;
  export let placeholder = null;

  let loaded = false;

  function load(node) {
    if (height) {
      node.style.height = (typeof height === 'number') ? height + 'px' : height;
    }

    const loadHandler = throttle(() => {
      const top = node.getBoundingClientRect().top;
      const expectedTop = window.innerHeight + offset;

      if (top <= expectedTop) {
        loaded = true;
        setTimeout(() => node.style.height = 'auto');
        onload && onload(node);
        removeListeners();
      }
    }, 200)

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

  // from underscore souce code
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
  };
</script>
