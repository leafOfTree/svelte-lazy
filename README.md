# svelte-lazy

A svelte component to lazyload any content including images.

<p align="center">
<img alt="demo image" src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/HEAD/svelte-lazy.gif" width="300" height="300" />
</p>

## Install

    npm i svelte-lazy

For sapper server-side rendering and [Using external components](https://github.com/sveltejs/sapper-template#using-external-components), install it to `devDependencies`:

    npm i -D svelte-lazy

## Usage
```html
<script>
  import Lazy from 'svelte-lazy';
</script>

<Lazy height={300} offset={150}>
  <img alt="" src="https://picsum.photos/id/412/200/300" />
</Lazy>
```

## Options

### Lazy

- `height: Number|String` Default: `0`. Height of the placeholder before the component is loaded. Set a proper value to avoid scroll bounce.

- `offset: Number` Default: `150`. Offset to the bottom of viewport that triggers loading when the component is within the scope.

    > The Number value uses `px` as unit.

- `placeholder: String|Component` Default: `null`. Placeholder before the component is loaded.

- `fadeOption: Object` Default: `{ delay: 0, duration: 400 }`. Option for the fade transition. Set `null` to disable it.

- `resetHeightDelay: Number` Default: `0` (milliseconds). Delay to reset the component height to `auto` after it is loaded. Might be useful for remote resources like images to load first.

- `onload: Function (node) => {}` Default: `null`. Fucntion that is called when the component is loaded.

## Demo

See [demo on svelte.dev/repl](https://svelte.dev/repl/6d7714fa3cce4909af6c6d187271e0a1?version=3.6.10).

## Development

    git clone https://github.com/leafOfTree/svelte-lazy
    cd svelte-lazy
    npm i
    npm start

## Refs

Based on [sveltejs/component-template: A base for building shareable Svelte components](https://github.com/sveltejs/component-template)
