<script>
  import Tabs from './Tabs.svelte';
  import ScrollList from './ScrollList.svelte';
  import FilterList from './FilterList.svelte';

  const items = [
    {
      label: 'Scroll',
      value: 1,
      component: ScrollList,
    },
    {
      label: 'Filter',
      value: 2,
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
