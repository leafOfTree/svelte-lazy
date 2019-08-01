<div use:load>
  {#if loaded}
    <slot>
      Lazy load content 
    </slot>
  {/if}
</div>
<script>
  export let loaded = false;
  export let height = 0;
  export let offset = 150;

  function load(node) {
    if (height) {
      node.style.height = height + 'px';
    }

    const loadHandler = () => {
      const top = node.getBoundingClientRect().top;
      const expectedTop = window.innerHeight + offset;

      if (top <= expectedTop) {
        loaded = true;
        node.style.height = '';
        document.removeEventListener('scroll', loadHandler);
      }
    }

    document.addEventListener('scroll', loadHandler);

    return {
      destroy: () => {
        document.removeEventListener('scroll', loadHandler);
      },
    };
  }
</script>

