<!-- Recorded by scripts/record-demo.js into docs/demo.gif -->
<script>
  import Lazy from '../../src/index.svelte';
  import Skeleton from './Skeleton.svelte';
  import Chart from './Chart.svelte';
  import Table from './Table.svelte';
  import List from './List.svelte';
  import Comment from './Comment.svelte';

  // <Lazy> takes any content: images, charts, tables, lists, text...
  const groups = [
    {
      title: 'Images',
      items: [
        { name: 'Jellyfish', photo: 'jellyfish' },
        { name: 'Strawberries', photo: 'strawberries' },
        { name: 'Fjord', photo: 'fjord' },
      ],
    },
    {
      title: 'Charts',
      items: [
        { name: 'Visitors', component: Chart, props: { type: 'line' } },
        { name: 'Traffic', component: Chart, props: { type: 'donut' } },
        { name: 'Revenue', component: Chart, props: { type: 'kpi' } },
      ],
    },
    {
      title: 'Any content',
      items: [
        { name: 'Orders', component: Table },
        { name: 'Team', component: List },
        { name: 'Comment', component: Comment },
      ],
    },
  ];
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  let events = $state([]);
  const onload = (name) => () => {
    events = [...events, name];
  };
</script>

<main>
  <section class="feed">
    {#each groups as group (group.title)}
      <h2>{group.title}</h2>
      {#each group.items as item (item.name)}
        <Lazy height={198} offset={0} placeholder={Skeleton} onload={onload(item.name)}>
          <article>
            {#if item.photo}
              <!-- Delayed by the recording server, so the placeholder shows -->
              <img alt={item.name} src="slow/{item.photo}.jpg" />
            {:else}
              <item.component {...item.props} />
            {/if}
            <p>{item.name}</p>
          </article>
        </Lazy>
      {/each}
    {/each}
  </section>

  <aside>
    <h1>svelte-lazy</h1>
    <p class="hint">Content loads when it scrolls into view</p>
    <div class="count">{events.length} / {total} loaded</div>
    <ol>
      {#each events as name, i (i)}
        <li><code>onload</code> {name}</li>
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
    gap: 36px;
    padding: 24px;
    height: 480px;
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
  img {
    display: block;
    width: 100%;
    height: 132px;
    object-fit: cover;
    border-radius: 8px;
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
</style>
