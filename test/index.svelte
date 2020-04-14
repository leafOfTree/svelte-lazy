<h1>Hello Lazy!</h1>

<img alt="" src="https://picsum.photos/id/412/200/300" />
<img alt="" src="https://picsum.photos/id/412/200/300" />
<img alt="" src="https://picsum.photos/id/412/200/300" />

{#each [0, 1, 2, 3, 4, 5, 6] as i}
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
    <div>Any content can be here.</div>
  </Lazy>
{/each}

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
  }
  div {
    height: 300px;
  }
</style>
