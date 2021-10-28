<h1>Hello, Lazy!</h1>
<div class="container">
  <!-- 
  Image credits:
  p1.jpg: https://picsum.photos/id/412/400/300 
  p2.jpg: https://picsum.photos/id/547/400/300
  -->

  <Lazy 
    class="top"
    height={300} 
    placeholder={'Loading...'} 
    fadeOption={{delay: 100, duration: 4000}} 
  >
    <img alt="" src="auto/p2.jpg" />
  </Lazy>

  <div class="preload">
    {#each [1, 2, 3] as i}
      <img alt="" src="auto/p1.jpg" />
    {/each}
  </div>

  <Lazy height={300}>
    <video controls height={300}>
      <source src="auto/flower.mp4" />
    </video>
  </Lazy>

  <!-- test -->
  <Lazy 
    class="basic"
    height={300} 
    placeholder={'Loading...'} 
  >
    <img alt="p3" src="auto/p3.jpg" />
  </Lazy>

  {#each [1, 2, 3] as i}
    <Lazy 
      class="extend"
      height={300}
      onload={onload} 
      placeholder={Loading}
      fadeOption={{delay: 100, duration: 2000}} 
    >
      <img alt="" src="auto/p2.jpg" />
    </Lazy>
  {/each}

  <Lazy 
    class="any-content"
    height={300} 
    offset={300}
    placeholder={'Loading...'} 
    fadeOption={{delay: 100, duration: 2000}} 
  >
    <div class="text-content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
  </Lazy>
</div>

<script>
  import Lazy from '../src/index.svelte';
  import Loading from './Loading.svelte';

  window.extend = { onload: false };
  const onload = node => {
    window.extend.onload = true;
    console.log('Trigger onload');
  }
</script>

<style>
  img {
    display: block;
    margin: 12px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(0,0,0,.05), 0 2px 3px 0 rgba(0,0,0,.1);
  }
  h1 {
    width: 70vh;
    margin: auto;
    margin-bottom: 6vh;
  }
  .preload {
    min-height: 900px;
  }
  .container {
    width: 70vh;
    height: 70vh;
    overflow-y: scroll;
    margin: auto;
    position: relative;
  }
  .text-content {
    height: 300px;
  }
</style>
