<h1>Hello, Lazy!</h1>
<div class="container">
  <div class="preload">
    {#each [1, 2, 3] as i}
      <img alt="" src="https://picsum.photos/id/412/400/300" />
    {/each}
  </div>

  <Lazy 
    class="loading"
    height={300} 
    placeholder={'Loading...'} 
  >
    <img alt="" src="https://picsum.photos/id/547/400/300" />
  </Lazy>

  <Lazy 
    height={300}
    offset={-300} 
    onload={onload} 
    fadeOption={{delay: 1000, duration: 2000}} 
    placeholder={Loading}
  >
    <img alt="" src="https://picsum.photos/id/547/400/300" />
  </Lazy>

  <Lazy height={300} placeholder={'Loading...'} fadeOption={null}>
    <div class="any-content">Any content can be here.</div>
  </Lazy>
</div>

<script>
  import Lazy from '../src/index.svelte';
  import Loading from './Loading.svelte';

  const onload = (node) => {
    console.log('on load');
  }
</script>

<style>
  img {
    display: block;
    margin-bottom: 12px;
  }
  h1 {
    width: 70vh;
    margin: auto;
  }
  .container {
    width: 70vh;
    height: 70vh;
    overflow-y: scroll;
    margin: auto;
    margin-top: 6vh;
  }
  .preload {
    min-height: 900px;
  }
  .any-content {
    height: 300px;
  }
</style>
