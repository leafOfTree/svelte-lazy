# svelte-lazy

A svelte component to lazyload any content including images.

## Install

    npm i svelte-lazy

## Usage

[Demo](https://svelte.dev/repl/6d7714fa3cce4909af6c6d187271e0a1?version=3.6.10)

```html
<Lazy height={300} offset={150}>
  <img alt="" src="https://picsum.photos/id/412/200/300" />
</Lazy>

<script>
  import Lazy from 'svelte-lazy';
</script>
```

## Options

### Lazy

- `height: Number/String` Default: `0`. Height of the placeholder before the component is loaded. Set a proper value to avoid scroll bounce.

- `offset: Number` Default: `150`. Offset to the bottom of viewport that triggers loading when the component is within the scope.

- `fadeOption: Object` Default: `{ delay: 0, duration: 400 }`. Option for the fade transition. Set `null` to disable.

- `onload: Function (node) => {}` Default: `null`. Fucntion that is called when the component is loaded.

## Refs

[sveltejs/component-template: A base for building shareable Svelte components](https://github.com/sveltejs/component-template)
