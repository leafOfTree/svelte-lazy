<script>
  import Tabs from './Tabs.svelte';
  import ScrollList from './ScrollList.svelte';
  import LongScrollList from './LongScrollList.svelte';
  import FilterList from './FilterList.svelte';
  import ScrollListKeep from "./ScrollListKeep.svelte";

  const items = [
    {
      label: 'Basic',
      value: 1,
      component: ScrollList,
    },
    {
      label: 'Long Scroll',
      value: 2,
      component: LongScrollList,
    },
    {
      label: 'Scroll (Keep After Show)',
      value: 3,
      component: ScrollListKeep,
    },
    {
      label: 'Filter',
      value: 4,
      component: FilterList,
    },
  ]
</script>

<h1>Hello, Lazy!</h1>
<Tabs {items} />

<style>
  h1 {
    width: 80vh;
    margin: auto;
    margin-bottom: 6vh;
  }
</style>
