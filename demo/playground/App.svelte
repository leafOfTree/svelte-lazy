<script>
  import Lazy from 'svelte-lazy';
  import { SvelteSet } from 'svelte/reactivity';

  // Photos from Unsplash by way of Lorem Picsum
  const photos = [1069, 1080, 1025, 1015, 1074, 225, 1084, 1036, 292, 433, 1011, 180];
  // Ids of the photos loaded at least once
  const loaded = new SvelteSet();
</script>

<h1>svelte-lazy</h1>
<p>Each photo loads when it scrolls into view. Scroll down to load more.</p>

{#each photos as id (id)}
  <Lazy height={240} placeholder="Loading..." onload={() => loaded.add(id)}>
    <img alt="" src="https://picsum.photos/id/{id}/400/240" />
  </Lazy>
{/each}

<div class="badge">Loaded {loaded.size} / {photos.length}</div>

<style>
  :global(.svelte-lazy) {
    max-width: 400px;
    margin: 16px 0;
  }
  :global(.svelte-lazy-placeholder) {
    height: 100%;
    display: grid;
    place-items: center;
    border-radius: 8px;
    background: rgb(127 127 127 / 0.15);
    opacity: 0.7;
  }
  img {
    display: block;
    width: 100%;
    height: 240px;
    object-fit: cover;
    border-radius: 8px;
  }
  .badge {
    position: fixed;
    bottom: 12px;
    left: 12px;
    padding: 6px 12px;
    border-radius: 8px;
    background: #7c5cff;
    color: white;
    font-weight: bold;
  }
</style>
