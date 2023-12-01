<script>
  import Tabs from './Tabs.svelte';
  import ScrollList from './ScrollList.svelte';
  import LongScrollList from './LongScrollList.svelte';
  import FilterList from './FilterList.svelte';
  import ScrollListKeep from "./ScrollListKeep.svelte";

  const items = [
    {
      label: 'Scroll',
      value: 1,
      component: ScrollList,
    },
    {
      label: 'Long Scroll',
      value: 2,
      component: LongScrollList,
    },
    {
      label: 'Filter',
      value: 3,
      component: FilterList,
    },
    {
        label: 'Scroll Keep',
        value: 4,
        component: ScrollListKeep,
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
