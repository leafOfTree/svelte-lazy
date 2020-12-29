<h1>Hello, Lazy!</h1>
<div class="container">
  <!-- 
  Image credits:
  p1.jpg: https://picsum.photos/id/412/400/300 
  p2.jpg/p4.jpg: https://picsum.photos/id/547/400/300
  -->

  <Lazy 
    class="top"
    height={300} 
    placeholder={'Loading...'} 
  >
    <img alt="" src="p2.jpg" />
  </Lazy>

  <div class="preload">
    {#each [1, 2, 3] as i}
      <img alt="" src="p1.jpg" />
    {/each}
  </div>

  <!-- test -->
  <Lazy 
    class="basic"
    height={300} 
    placeholder={'Loading...'} 
  >
    <img alt="" src="p2.jpg" />
  </Lazy>

  <Lazy 
    class="extend"
    height={300}
    offset={300}
    onload={onload} 
    fadeOption={null}
    placeholder={Loading}
  >
    <img alt="" src="p2.jpg" />
  </Lazy>

  <Lazy 
    class="custom-props"
    height={300}
    offset={300}
    onload={onload} 
    fadeOption={null}
    placeholder={Loading}
    placeholderProps={{name: 'Custom'}}
  >
    <img alt="" src="p2.jpg" />
  </Lazy>

  <Lazy 
    class="any-content"
    height={300} 
    placeholder={'Loading...'} 
    fadeOption={{delay: 1000, duration: 2000}} 
  >
    <div class="text-content">Any content can be here.</div>
  </Lazy>

  <Lazy 
    class="img404"
    height={300}
    offset={300}
    onload={onload} 
    fadeOption={null}
    placeholder={Loading}
  >
    <img alt="" src="p3.jpg" />
  </Lazy>

  <Lazy 
    class="img-delay"
    height={300}
    offset={300}
    placeholder={'Loading...'}
  >
    <img alt="" src="delay.jpg" />
  </Lazy>
</div>

<script>
  import Lazy from '../../src/index.svelte';
  import Loading from './Loading.svelte';

  window.extend = { onload: false };
  const onload = (node) => {
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
  .container {
    width: 70vh;
    height: 70vh;
    overflow-y: scroll;
    margin: auto;
    position: relative;
  }
  .preload {
    min-height: 900px;
  }
  .text-content {
    height: 300px;
  }
</style>
