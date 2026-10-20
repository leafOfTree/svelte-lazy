<script>
  import Lazy from '../src/index.svelte';
  import Loading from './Loading.svelte';

  window.extend = { onload: false };
  const onload = () => {
    window.extend.onload = true;
    console.log('Trigger onload');
  };
</script>

<div class="container">
  <!-- Image and video credits: public/media/CREDITS.md -->

  <Lazy
    keep={true}
    class="top"
    height={300}
    placeholder="Loading..."
    fadeOption={{ delay: 100, duration: 4000 }}
  >
    <img alt="" src="media/snow.jpg" />
  </Lazy>

  <div class="preload">
    {#each ['bear', 'pug', 'canoe'] as name (name)}
      <img alt="" src="media/{name}.jpg" />
    {/each}
  </div>

  <Lazy keep={true}>
    <video controls height={300}>
      <track kind="captions" />
      <source src="media/flower.mp4" />
    </video>
  </Lazy>

  <Lazy height={300} keep={true}>
    <video controls height={300}>
      <track kind="captions" />
      <source src="media/flower.mp4" />
    </video>
  </Lazy>

  <!-- test 404 resource -->
  <Lazy keep={true} class="basic" height={300} placeholder="Loading...">
    <img alt="missing" src="media/missing.jpg" />
  </Lazy>

  {#each ['laptop', 'strawberries', 'jellyfish'] as name (name)}
    <Lazy
      keep={true}
      class="extend"
      height={300}
      {onload}
      placeholder={Loading}
      fadeOption={{ delay: 100, duration: 2000 }}
    >
      <img alt="" src="media/{name}.jpg" />
    </Lazy>
  {/each}

  <Lazy
    keep={true}
    class="any-content"
    height={300}
    offset={300}
    placeholder="Loading..."
    fadeOption={{ delay: 100, duration: 2000 }}
  >
    <div class="text-content">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </div>
  </Lazy>
</div>

<style>
  img,
  video {
    display: block;
    margin: 12px;
    border-radius: 6px;
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.05),
      0 2px 3px 0 rgba(0, 0, 0, 0.1);
  }
  .preload {
    min-height: 900px;
  }
  .container {
    width: 80vh;
    height: 70vh;
    overflow-y: scroll;
    margin: auto;
    position: relative;
  }
  .text-content {
    height: 300px;
  }
</style>
