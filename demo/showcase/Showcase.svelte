<!-- Recorded by scripts/record-demo.js into docs/demo.gif -->
<script>
  import Lazy from '../../src/index.svelte';
  import Skeleton from './Skeleton.svelte';
  import Chart from './Chart.svelte';

  const items = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    type: i === 3 || i === 7 ? 'chart' : 'photo',
    // Images are delayed by the recording server, so the placeholder shows
    src: `slow/p${(i % 2) + 1}.jpg?${i}`,
    hue: [0, 0, 20, 0, -20, 10, 0, 0, -10][i],
  }));

  let events = $state([]);
  const onload = (id) => () => {
    events = [...events, id];
  };
</script>

<main>
  <section class="feed">
    {#each items as item (item.id)}
      <Lazy height={190} offset={0} placeholder={Skeleton} onload={onload(item.id)}>
        <article>
          {#if item.type === 'photo'}
            <img alt="" src={item.src} style="filter: hue-rotate({item.hue}deg)" />
          {:else}
            <Chart />
          {/if}
          <p>{item.type === 'photo' ? 'Photo' : 'Chart'} #{item.id}</p>
        </article>
      </Lazy>
    {/each}
  </section>

  <aside>
    <h1>svelte-lazy</h1>
    <p class="hint">Content loads when it scrolls into view</p>
    <div class="count">{events.length} / {items.length} loaded</div>
    <ol>
      {#each events as id, i (i)}
        <li><code>onload</code> #{id}</li>
      {/each}
    </ol>
  </aside>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
    background: #fff;
    color: #1f2328;
  }
  main {
    display: flex;
    gap: 24px;
    /* The feed ends at the window bottom: on mount, <Lazy> checks the
       window height, not the feed */
    padding: 20px 20px 0;
    height: 440px;
    box-sizing: border-box;
  }
  .feed {
    width: 300px;
    flex: none;
    overflow-y: auto;
    border: 1px solid #d0d7de;
    border-bottom: 0;
    border-radius: 12px 12px 0 0;
    padding: 0 12px;
    scrollbar-width: none;
  }
  .feed :global(.svelte-lazy) {
    margin: 12px 0;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 0 0 1px #e6e8eb;
  }
  article {
    padding: 12px;
  }
  img {
    display: block;
    width: 100%;
    height: 132px;
    object-fit: cover;
    border-radius: 8px;
  }
  article p {
    margin: 10px 0 0;
    font-size: 14px;
    font-weight: 600;
  }
  aside {
    flex: 1;
    min-width: 0;
  }
  h1 {
    margin: 4px 0 4px;
    font-size: 26px;
  }
  .hint {
    margin: 0 0 16px;
    color: #59636e;
  }
  .count {
    font-size: 20px;
    font-weight: 700;
    color: #7c5cff;
    margin-bottom: 8px;
  }
  ol {
    margin: 0;
    padding-left: 22px;
    font-size: 15px;
    line-height: 1.7;
  }
  code {
    color: #0969da;
  }
</style>
