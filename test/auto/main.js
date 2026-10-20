import * as svelte from 'svelte';
import App from './index.svelte';

// Svelte 5 mounts components by mount(), Svelte 3 and 4 by new
const target = document.body;
const app = svelte.mount ? svelte.mount(App, { target }) : new App({ target });

export default app;
