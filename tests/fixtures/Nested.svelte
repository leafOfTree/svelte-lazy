<!-- <Lazy> at the top of a 300px high scroll container, inside another one
     after a spacer of `before` px -->
<script>
  import Lazy from '../../src/index.svelte';

  let { before = 0, ...lazyProps } = $props();
</script>

<div class="outer" style="height: 300px; overflow-y: auto">
  <div style="height: {before}px"></div>
  <div class="inner" style="height: 300px; overflow-y: auto">
    <Lazy {...lazyProps}>
      <div class="content">Loaded content</div>
    </Lazy>
    <div style="height: 3000px"></div>
  </div>
  <div style="height: 3000px"></div>
</div>
