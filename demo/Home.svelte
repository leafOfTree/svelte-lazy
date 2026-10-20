<!-- Home page of the examples site -->
<script>
  import Feed from './showcase/Feed.svelte';
  import { anyContentMore, keepContent, longList, filterContent } from './showcase/items.js';
</script>

<div class="page">
  <header>
    <img
      class="logo"
      alt=""
      src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg"
    />
    <h1>svelte-lazy</h1>
    <p>A Svelte component to lazy load any content: images, charts, tables or anything else.</p>
    <code class="install">npm i svelte-lazy</code>
    <nav>
      <a href="https://github.com/leafOfTree/svelte-lazy">GitHub</a>
      <a href="https://www.npmjs.com/package/svelte-lazy">npm</a>
      <a href="https://github.com/leafOfTree/svelte-lazy/tree/master/demo">Source of this page</a>
    </nav>
  </header>

  <section>
    <h2>Any content</h2>
    <p>
      Each item shows a placeholder, and loads when it scrolls into view. When it leaves, it unloads
      and gets its height back. A broken image keeps the height too.
    </p>
    <div class="frame"><Feed groups={anyContentMore} /></div>
  </section>

  <section>
    <h2>Load once with <code>keep</code></h2>
    <p>Scroll down, then back up: loaded content stays, so nothing loads again.</p>
    <div class="frame">
      <Feed groups={keepContent} keep hint="With keep, content loads only once" />
    </div>
  </section>

  <section>
    <h2>Long list</h2>
    <p>A thousand items, and only the ones in view are loaded.</p>
    <div class="frame">
      <Feed groups={longList} height={64} hint="Only the rows in view are loaded" />
    </div>
  </section>

  <section>
    <h2>Filter</h2>
    <p>Filter the list: items that come into view load, the rest stay placeholders.</p>
    <div class="frame">
      <Feed groups={filterContent} filter hint="Type to filter the photos" />
    </div>
  </section>
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
    padding: 48px 16px;
  }
  header {
    text-align: center;
    margin-bottom: 24px;
  }
  .logo {
    width: 56px;
  }
  h1 {
    margin: 8px 0;
    font-size: 36px;
  }
  header p {
    margin: 0 0 20px;
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
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 20px;
    margin-top: 20px;
  }
  a {
    color: #7c5cff;
    font-weight: 600;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  section {
    margin-top: 48px;
  }
  h2 {
    margin: 0 0 6px;
    font-size: 22px;
  }
  section > p {
    margin: 0 0 16px;
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
