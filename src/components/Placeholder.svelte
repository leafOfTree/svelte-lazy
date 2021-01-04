<div class={placeholderClass}>
  {#if typeof placeholder === 'string'}
    <div>{placeholder}</div>
  {:else if ['function', 'object'].includes(typeof placeholder)}
    <svelte:component this={placeholder} {...placeholderProps} />
  {/if}
</div>
<script>
  export let placeholder = null;
  export let placeholderProps = null;
  const placeholderClass = 'svelte-lazy-placeholder';
</script>
