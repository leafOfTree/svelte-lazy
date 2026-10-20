<!-- <Lazy> inside a 300px high scroll container, after a spacer of `before` px.
     `marginTop` moves the scroller down the page -->
<script>
  import Lazy from '../../src/index.svelte';

  let { before = 0, marginTop = 0, src = null, ...lazyProps } = $props();
</script>

<div class="scroller" style="height: 300px; overflow-y: auto; margin-top: {marginTop}px">
  <div style="height: {before}px"></div>
  <Lazy {...lazyProps}>
    {#if src}
      <img alt="" {src} />
    {:else}
      <div class="content">Loaded content</div>
    {/if}
  </Lazy>
  <div style="height: 3000px"></div>
</div>
