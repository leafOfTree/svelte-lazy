<!-- Home page of the examples site -->
<script>
  import Feed from './showcase/Feed.svelte';
  import { anyContentMore, keepContent, longList, filterContent } from './showcase/items.js';

  const tabs = [
    {
      id: 'any',
      label: 'Any content',
      text: 'Each item shows a placeholder, and loads when it scrolls into view. When it leaves, it unloads and gets its height back. A broken image keeps the height too.',
      props: { groups: anyContentMore },
    },
    {
      id: 'keep',
      label: 'Keep',
      text: 'With keep, content loads only once: scroll down, then back up, and nothing loads again.',
      props: { groups: keepContent, keep: true, hint: 'With keep, content loads only once' },
    },
    {
      id: 'long',
      label: 'Long list',
      text: 'A thousand items, and only the ones in view are loaded.',
      props: { groups: longList, height: 64, hint: 'Only the rows in view are loaded' },
    },
    {
      id: 'filter',
      label: 'Filter',
      text: 'Filter the list: items that come into view load, the rest stay placeholders.',
      props: { groups: filterContent, filter: true, hint: 'Type to filter the photos' },
    },
  ];

  // The tab is in the URL hash, so a tab can be linked to
  const fromHash = () => (tabs.find((tab) => `#${tab.id}` === location.hash) ?? tabs[0]).id;
  let activeId = $state(fromHash());
  const active = $derived(tabs.find((tab) => tab.id === activeId));
</script>

<svelte:window onhashchange={() => (activeId = fromHash())} />

<div class="page">
  <header>
    <h1>
      <img
        class="logo"
        alt=""
        src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg"
      />
      svelte-lazy
    </h1>
    <p>A Svelte component to lazy load any content: images, charts, tables or anything else.</p>
    <code class="install">npm i svelte-lazy</code>
    <nav class="links">
      <a href="https://github.com/leafOfTree/svelte-lazy">GitHub</a>
      <a href="https://www.npmjs.com/package/svelte-lazy">npm</a>
      <a href="https://github.com/leafOfTree/svelte-lazy/tree/master/demo">Source of this page</a>
    </nav>
  </header>

  <div class="tabs" role="tablist">
    {#each tabs as tab (tab.id)}
      <a
        href="#{tab.id}"
        role="tab"
        aria-selected={tab.id === activeId}
        class:active={tab.id === activeId}>{tab.label}</a
      >
    {/each}
  </div>
  <p class="text">{active.text}</p>

  <!-- A new feed for each tab, so its count starts again -->
  {#key activeId}
    <div class="frame" role="tabpanel"><Feed {...active.props} /></div>
  {/key}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family:
      system-ui,
      -apple-system,
      'Segoe UI',
      sans-serif;
    background: #f6f8fa;
    color: #1f2328;
  }
  .page {
    max-width: 640px;
    margin: 0 auto;
    padding: 24px 16px;
  }
  header {
    text-align: center;
    margin-bottom: 20px;
  }
  h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin: 0 0 6px;
    font-size: 32px;
  }
  .logo {
    width: 40px;
  }
  header p {
    margin: 0 0 14px;
    color: #59636e;
    font-size: 17px;
  }
  .install {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 8px;
    background: #1f2328;
    color: #fff;
    font-size: 15px;
  }
  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 20px;
    margin-top: 14px;
  }
  a {
    color: #7c5cff;
    font-weight: 600;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  .tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 12px;
    background: #eaeef2;
  }
  .tabs a {
    flex: 1;
    padding: 8px 4px;
    border-radius: 8px;
    color: #59636e;
    text-align: center;
    white-space: nowrap;
  }
  .tabs a:hover {
    color: #1f2328;
    text-decoration: none;
  }
  .tabs a.active {
    background: #fff;
    color: #1f2328;
    box-shadow: 0 1px 3px rgb(31 35 40 / 0.12);
  }
  .text {
    min-height: 3em;
    margin: 12px 0;
    color: #59636e;
  }
  .frame {
    border-radius: 16px;
    overflow: hidden;
    background: #fff;
    box-shadow:
      0 0 0 1px #d0d7de,
      0 8px 24px rgb(140 149 159 / 0.2);
  }
</style>
