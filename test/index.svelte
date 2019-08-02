<h1>Hello Lazy!</h1>

<img alt="" src="https://picsum.photos/id/412/200/300" />
<img alt="" src="https://picsum.photos/id/412/200/300" />
<img alt="" src="https://picsum.photos/id/412/200/300" />

{#each [0, 1, 2, 3, 4, 5] as i}
  <Lazy height={400} offset={150} onload={onload}>
    <img alt="" src="https://picsum.photos/id/547/200/300" />
  </Lazy>
{/each}
{#each [0, 1, 2, 3, 4, 5] as i}
  <Lazy height={400} offset={150} onload={onload}>
    <div>Any content can be here.</div>
  </Lazy>
{/each}

<script>
  import Lazy from '../src/index.svelte';

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
