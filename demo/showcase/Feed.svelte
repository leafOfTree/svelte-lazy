<!-- A feed of <Lazy> items, with the count and a log of the loads. Used on
     the examples site, and recorded into docs/demo.gif by
     scripts/record-demo.mjs -->
<script>
  import Lazy from '../../src/index.svelte';
  import Skeleton from './Skeleton.svelte';

  let {
    groups,
    keep = false,
    // Item height. Rows of long lists are lower
    height = 198,
    // The recording delays images from slow/, so the placeholder shows
    imageBase = 'media/',
    title = '',
    hint = 'Content loads when it scrolls into view',
    // Show an input to filter items by name
    filter = false,
  } = $props();

  let query = $state('');
  const shown = $derived(
    groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.name.toLowerCase().includes(query.trim().toLowerCase()),
        ),
      }))
      .filter((group) => group.items.length),
  );
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  // The latest loads and unloads, newest first, and how many items are
  // loaded now
  let events = $state([]);
  let loadedNow = $state(0);
  let count = 0;
  const log = (type, name) => {
    count += 1;
    events = [{ n: count, type, name }, ...events].slice(0, 8);
  };
  const onload = (name) => () => log('load', name);

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
    {#each shown as group (group.title)}
      <h2>{group.title}</h2>
      {#each group.items as item (item.name)}
        <Lazy
          {height}
          {keep}
          offset={0}
          placeholder={Skeleton}
          placeholderProps={{ row: !!item.row }}
          onload={onload(item.name)}
        >
          {#if item.row}
            <article class="row">
              <span class="avatar" style="background: {item.row}"></span>
              <p>{item.name}</p>
            </article>
          {:else}
            <article>
              {#if item.photo}
                <img alt={item.name} src="{imageBase}{item.photo}.jpg" />
              {:else if item.video}
                <video src={item.video} muted loop autoplay playsinline></video>
              {:else}
                <item.component {...item.props} />
              {/if}
              <p>{item.name}</p>
            </article>
          {/if}
        </Lazy>
      {/each}
    {:else}
      <p class="empty">No match</p>
    {/each}
  </section>

  <aside>
    {#if title}<h1>{title}</h1>{/if}
    <p class="hint">{hint}</p>
    {#if filter}
      <input bind:value={query} placeholder="Filter by name" aria-label="Filter by name" />
    {/if}
    <div class="count">{loadedNow} / {total} loaded now</div>
    <ul class="log">
      {#each events as event (event.n)}
        <li class={event.type}>
          {#if event.type === 'load'}
            <span class="mark">+</span> {event.name} <code>onload</code>
          {:else}
            <span class="mark">−</span> {event.name} unloaded
          {/if}
        </li>
      {/each}
    </ul>
  </aside>
</main>

<style>
  main {
    display: flex;
    gap: 36px;
    padding: 24px;
    height: 440px;
    box-sizing: border-box;
  }
  .feed {
    width: 300px;
    flex: none;
    overflow-y: auto;
    border: 1px solid #d0d7de;
    border-radius: 14px;
    padding: 0 18px;
    scrollbar-width: none;
  }
  .feed :global(.svelte-lazy) {
    margin: 18px 0;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 0 0 1px #e6e8eb;
  }
  h2 {
    margin: 24px 2px 0;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #59636e;
  }
  article {
    padding: 16px;
  }
  img,
  video {
    display: block;
    width: 100%;
    height: 132px;
    object-fit: cover;
    border-radius: 8px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    /* As high as the placeholder: content of another height moves the items
       below, so items at the edge of the view would load and unload again */
    height: 64px;
    padding: 0 16px;
    box-sizing: border-box;
  }
  .avatar {
    width: 32px;
    height: 32px;
    flex: none;
    border-radius: 50%;
  }
  .row p {
    margin: 0;
  }
  .empty {
    margin-top: 24px;
    color: #59636e;
  }
  input {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 16px;
    padding: 8px 10px;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    font: inherit;
  }
  article p {
    margin: 12px 0 0;
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
  .log {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 15px;
    line-height: 1.7;
  }
  .log li:nth-child(n + 4) {
    opacity: 0.6;
  }
  .mark {
    display: inline-block;
    width: 1em;
    font-weight: 700;
  }
  .load .mark {
    color: #1a7f37;
  }
  .unload {
    color: #59636e;
  }
  code {
    color: #0969da;
  }
  /* Narrow screens: the log goes below the feed */
  @media (max-width: 600px) {
    main {
      flex-direction: column;
      height: auto;
    }
    .feed {
      width: auto;
      height: 440px;
    }
  }
</style>
