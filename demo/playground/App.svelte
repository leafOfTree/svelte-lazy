<script>
  import Lazy from 'svelte-lazy';

  const photos = [1069, 1080, 1015, 1074, 225, 1084];
  let loaded = $state(0);
</script>

<header>Loaded: {loaded}</header>

<h1>svelte-lazy</h1>
<p>Scroll down: each card loads when it comes into view, and unloads when it leaves.</p>

{#each photos as id (id)}
  <Lazy height={240} placeholder="Loading..." onload={() => loaded++}>
    <img alt="" src="https://picsum.photos/id/{id}/400/240" />
  </Lazy>
{/each}

<!-- keep: load only once -->
<Lazy height={240} keep placeholder="Loading..." onload={() => loaded++}>
  <div class="card">Any content, kept after it loads</div>
</Lazy>

<style>
  header {
    position: fixed;
    top: 12px;
    right: 12px;
    z-index: 1;
    padding: 6px 12px;
    border-radius: 8px;
    background: #7c5cff;
    color: white;
    font-weight: bold;
  }
  p {
    margin-bottom: 120vh;
  }
  :global(.svelte-lazy) {
    margin: 16px 0;
  }
  :global(.svelte-lazy-placeholder) {
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: #f0f0f0;
    color: #888;
  }
  img,
  .card {
    display: block;
    width: 400px;
    height: 240px;
    border-radius: 8px;
  }
  .card {
    display: grid;
    place-items: center;
    background: #f4f1ff;
    color: #7c5cff;
  }
</style>
