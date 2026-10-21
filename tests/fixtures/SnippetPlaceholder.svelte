<!-- <Lazy> with a snippet as the placeholder, 2000px down the window -->
<script>
  import Lazy from '../../src/Lazy.svelte';

  let props = $props();
</script>

<div style="height: 2000px"></div>
<Lazy {...props}>
  {#snippet placeholder()}
    <span class="custom-placeholder">Loading images</span>
  {/snippet}
  <div class="content">Loaded content</div>
</Lazy>
