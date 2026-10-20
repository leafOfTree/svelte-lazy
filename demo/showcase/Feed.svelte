<!-- A feed of <Lazy> items, with the count and a log of the loads. Used on
     the examples site, and recorded into docs/demo.gif by
     scripts/record-demo.js -->
<script>
  import Lazy from '../../src/index.svelte';
  import Skeleton from './Skeleton.svelte';
  import { SvelteSet } from 'svelte/reactivity';

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

  // Content unloads when it leaves the view, and loads again when it comes
  // back: count each item once, and log the latest loads
  const loaded = new SvelteSet();
  let events = $state([]);
  let count = 0;
  const onload = (name) => () => {
    count += 1;
    events = [...events, { n: count, name, again: loaded.has(name) }].slice(-10);
    loaded.add(name);
  };
</script>

<main>
  <section class="feed">
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
    <div class="count">{loaded.size} / {total} loaded</div>
    <ol start={events[0]?.n}>
      {#each events as event (event.n)}
        <li>
          <code>onload</code>
          {event.name}
          {#if event.again}<span class="again">again</span>{/if}
        </li>
      {/each}
    </ol>
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
    height: 100%;
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
  ol {
    margin: 0;
    padding-left: 22px;
    font-size: 15px;
    line-height: 1.7;
  }
  code {
    color: #0969da;
  }
  .again {
    color: #59636e;
    font-size: 13px;
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
