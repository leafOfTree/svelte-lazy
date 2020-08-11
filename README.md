# svelte-lazy [![Build Status][1]][2] [![npm version][3]][4]

A svelte component to lazyload any content including images.

<p align="center">
<img alt="demo image" src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/HEAD/svelte-lazy.gif" width="300" height="300" />
</p>

## Installation

    npm i svelte-lazy

For sapper server-side rendering and [Using external components](https://github.com/sveltejs/sapper-template#using-external-components), install it to `devDependencies`:

    npm i -D svelte-lazy

## Usage
```html
<script>
  import Lazy from 'svelte-lazy';
</script>

<Lazy height={300}>
  <img alt="" src="https://picsum.photos/id/412/200/300" />
</Lazy>
```

## `<Lazy>` props

- `height: Number|String` Default: `0`. Height of the placeholder before the component is loaded. **Set a proper value** to avoid scroll bounce.

- `offset: Number` Default: `150`. Offset to the bottom of viewport that triggers loading when the component is in the scope.

> The Number value uses `px` as unit.

- `class: String` Default: `''`. Additional class for the container div. It will be `svelte-lazy ${class}`.

- `fadeOption: Object` Default: `{ delay: 0, duration: 400 }`. Option for the fade in transition. Set `null` to disable it.

- `onload: Function (node) => {}` Default: `null`. Fucntion that is called when the component is loaded.

- `placeholder: String|Component` Default: `null`. Placeholder before the component is loaded.

- `resetHeightDelay: Number` Default: `0` (milliseconds). Delay to reset the component height to `auto` after it is loaded. Might be useful for remote resources like images to load first.

## Changelog

v0 -> v1.0

- Adjust dom structure
- Optimize image loading

## Life cycle

```
            enter viewport  /                 no image -> loaded
not loaded --------------->
                            \ with image -> load event -> loaded
                                                |
            show placeholder                    |     show content
``` 

## Demo

See [demo on svelte.dev/repl](https://svelte.dev/repl/6d7714fa3cce4909af6c6d187271e0a1?version=3.6.10).

## Development

    git clone https://github.com/leafOfTree/svelte-lazy
    cd svelte-lazy
    npm i
    npm start

## Refs

Based on [sveltejs/component-template: A base for building shareable Svelte components](https://github.com/sveltejs/component-template)

[1]: https://travis-ci.com/leafOfTree/svelte-lazy.svg?branch=master
[2]: https://travis-ci.com/leafOfTree/svelte-lazy
[3]: https://img.shields.io/npm/v/svelte-lazy.svg
[4]: https://www.npmjs.com/package/svelte-lazy
