{#if placeholder}
  <div class={placeholderClass}>
    {#if typeof placeholder === 'string'}
      <div>{placeholder}</div>
    {:else if ['function', 'object'].includes(typeof placeholder)}
      {@const SvelteComponent = placeholder}
      <SvelteComponent {...placeholderProps} />
    {/if}
  </div>
{/if}

<script>
  /**
   * @typedef {Object} Props
   * @property {any} [placeholder]
   * @property {any} [placeholderProps]
   */

  /** @type {Props} */
  let { placeholder = null, placeholderProps = null } = $props();
  const placeholderClass = 'svelte-lazy-placeholder';
</script>
