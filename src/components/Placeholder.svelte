<div class={placeholderClass}>
  {#if typeof placeholder === 'string'}
    <div>{placeholder}</div>
  {:else if typeof placeholder === 'function'}
    <svelte:component this={placeholder} />
  {/if}
</div>
<script>
  export let placeholder = null;
  const placeholderClass = 'svelte-lazy-placeholder';
</script>
