<script>
  import Tabs from './Tabs.svelte';
  import ScrollList from './ScrollList.svelte';
  import LongScrollList from './LongScrollList.svelte';
  import FilterList from './FilterList.svelte';

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
