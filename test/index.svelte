<h1>Hello, Lazy!</h1>
<div class="container">
  <div class="preload">
    <img alt="" src="https://picsum.photos/id/412/200/300" />
    <img alt="" src="https://picsum.photos/id/412/200/300" />
    <img alt="" src="https://picsum.photos/id/412/200/300" />
  </div>

  {#each [0, 1, 2] as i}
    <Lazy height={300} placeholder={'Loading...'}>
      <img alt="" src="https://picsum.photos/id/547/200/300" />
    </Lazy>
  {/each}
  {#each [0, 1, 2] as i}
    <Lazy 
      height={300} 
      offset={150} 
      onload={onload} 
      fadeOption={{delay: 500, duration: 1000}} 
      placeholder={Loading}
    >
      <div class="any-content">Any content can be here.</div>
    </Lazy>
  {/each}

  <Lazy height={300} placeholder={'Loading...'} fadeOption={null}>
    <img alt="" src="https://picsum.photos/id/547/200/300" />
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
