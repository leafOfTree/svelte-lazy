// The page recorded into docs/demo.gif by scripts/record-demo.js
import { mount } from 'svelte';
import Feed from './Feed.svelte';
import { anyContent } from './items.js';

// Images are delayed by the recording server, so the placeholder shows
export default mount(Feed, {
  target: document.body,
  props: { groups: anyContent, title: 'svelte-lazy', imageBase: 'slow/' },
});
