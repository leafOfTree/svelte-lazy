<script>
  import Lazy from 'svelte-lazy';

  // Photos from Unsplash by way of Lorem Picsum
  const photos = [
    { name: 'Valley', id: 1043 },
    { name: 'Strawberries', id: 1080 },
    { name: 'Fjord', id: 1015 },
    { name: 'Pug', id: 1025 },
    { name: 'Tea', id: 225 },
    { name: 'Walrus', id: 1084 },
    { name: 'Snow', id: 1036 },
    { name: 'Bear', id: 433 },
  ];

  // The latest loads and unloads, newest first, and how many are loaded now
  let events = $state([]);
  let loadedNow = $state(0);
  let count = 0;
  const log = (type, name) => {
    count += 1;
    events = [{ n: count, type, name }, ...events].slice(0, 8);
  };

  // <Lazy> has no unload callback: watch the content leave the feed
  function watchUnloads(feed) {
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node.classList?.contains('svelte-lazy-content')) {
            log('unload', node.querySelector('p')?.textContent);
          }
        }
      }
      loadedNow = feed.querySelectorAll('.svelte-lazy-content').length;
    });
    observer.observe(feed, { childList: true, subtree: true });
    return { destroy: () => observer.disconnect() };
  }
</script>

<main>
  <section class="feed" use:watchUnloads>
    {#each photos as photo (photo.id)}
      <Lazy height={196} offset={0} placeholder="Loading..." onload={() => log('load', photo.name)}>
        <img alt={photo.name} src="https://picsum.photos/id/{photo.id}/400/240" />
        <p>{photo.name}</p>
      </Lazy>
    {/each}
  </section>

  <aside>
    <h1>svelte-lazy</h1>
    <p class="hint">Scroll the list: photos load in view, and unload when they leave</p>
    <div class="count">{loadedNow} / {photos.length} loaded now</div>
    <ul>
      {#each events as event (event.n)}
        <li class={event.type}>
          {#if event.type === 'load'}
            <b>+</b> {event.name} <code>onload</code>
          {:else}
            <b>−</b> {event.name} unloaded
          {/if}
        </li>
      {/each}
    </ul>
  </aside>
</main>

<style>
  main {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    font-family: system-ui, sans-serif;
  }
  .feed {
    width: 280px;
    height: 420px;
    overflow-y: auto;
    padding: 0 14px;
    border: 1px solid rgb(127 127 127 / 0.4);
    border-radius: 14px;
  }
  .feed :global(.svelte-lazy) {
    margin: 14px 0;
    border-radius: 10px;
    box-shadow: 0 0 0 1px rgb(127 127 127 / 0.3);
  }
  /* As high as the container before loading, so nothing moves */
  .feed :global(.svelte-lazy-content),
  .feed :global(.svelte-lazy-placeholder) {
    height: 196px;
    padding: 12px;
    box-sizing: border-box;
  }
  .feed :global(.svelte-lazy-placeholder) {
    display: grid;
    place-items: center;
    opacity: 0.6;
  }
  img {
    display: block;
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 8px;
  }
  .feed p {
    margin: 10px 0 0;
    font-weight: 600;
  }
  aside {
    flex: 1;
    min-width: 200px;
  }
  h1 {
    margin: 0 0 4px;
  }
  .hint {
    margin: 0 0 16px;
    opacity: 0.7;
  }
  .count {
    font-size: 20px;
    font-weight: 700;
    color: #7c5cff;
    margin-bottom: 8px;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    line-height: 1.7;
  }
  li:nth-child(n + 4) {
    opacity: 0.6;
  }
  b {
    display: inline-block;
    width: 1em;
  }
  .load b {
    color: #1a7f37;
  }
  .unload {
    opacity: 0.7;
  }
  code {
    color: #3d8bff;
  }
</style>
