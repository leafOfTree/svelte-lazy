<img src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg" width="60" alt="icon" align="left"/>

# svelte-lazy

[![npm version](https://img.shields.io/npm/v/svelte-lazy.svg)](https://www.npmjs.com/package/svelte-lazy)
[![CI](https://github.com/leafOfTree/svelte-lazy/actions/workflows/node.js.yml/badge.svg)](https://github.com/leafOfTree/svelte-lazy/actions/workflows/node.js.yml)

A Svelte component to lazy load any content: images, videos, components or anything else. It shows a placeholder until the content scrolls into view, and fades it in.

Native `loading="lazy"` covers images and iframes. svelte-lazy also defers rendering any markup or component, keeps the layout stable while images load, and works in scroll containers.

<p align="center">
  <img alt="Demo: cards show a placeholder, then load as they scroll into view" src="https://raw.githubusercontent.com/leafOfTree/svelte-lazy/master/docs/demo.gif" width="640" />
</p>

[Examples](https://leafoftree.github.io/svelte-lazy/) ([code](demo/index.svelte)) · [Playground](https://svelte.dev/playground/6d7714fa3cce4909af6c6d187271e0a1)

## Install

```sh
npm i svelte-lazy
```

It works with Svelte 3, 4 and 5, and comes with TypeScript types.

## Usage

```svelte
<script>
  import Lazy from 'svelte-lazy';
</script>

<Lazy height={300} placeholder="Loading...">
  <img alt="" src="https://picsum.photos/id/412/400/300" />
</Lazy>
```

> [!IMPORTANT]
> Set `height` to about the height of the content. Before loading, the container has this height. With the default `0`, all containers are empty and in view at once, so everything loads right away, and the page jumps when the content appears.

By default, content is unloaded when it leaves the viewport and loaded again when it comes back. Set `keep` to load it only once.

## Examples

Load only once, with a component as the placeholder:

```svelte
<script>
  import Lazy from 'svelte-lazy';
  import Spinner from './Spinner.svelte';
</script>

<Lazy height={400} keep placeholder={Spinner} placeholderProps={{ size: 'large' }}>
  <HeavyChart />
</Lazy>
```

Start loading earlier, 500px before the content scrolls into view, and know when it loads:

```svelte
<Lazy height={300} offset={500} onload={(node) => console.log('loaded', node)}>
  <video controls src="movie.mp4"></video>
</Lazy>
```

Link to content that isn't loaded yet. The container has the `id` before loading, so `#comments` scrolls to it and loads it:

```svelte
<a href="#comments">Comments</a>

<Lazy id="comments" height={600}>
  <Comments />
</Lazy>
```

Style the container, the placeholder and the content by their classes:

```svelte
<Lazy class="card" height={200}>...</Lazy>

<style>
  :global(.card .svelte-lazy-content) {
    border-radius: 8px;
  }
</style>
```

## Props

| Prop               | Type                  | Default                       | Description                                                                                                        |
| ------------------ | --------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `height`           | `number \| string`    | `0`                           | Height of the container before loading, in px or any CSS length like `'50vh'`                                      |
| `keep`             | `boolean`             | `false`                       | Keep the content after it leaves the viewport, instead of unloading it                                             |
| `offset`           | `number`              | `150`                         | Load when the top of the container is within this many px below the bottom of the viewport or the scroll container |
| `placeholder`      | `string \| Component` | `null`                        | Shown before loading, and while images in the content are loading                                                  |
| `placeholderProps` | `object`              | `null`                        | Props for a component placeholder                                                                                  |
| `id`               | `string`              | `undefined`                   | `id` of the container                                                                                              |
| `class`            | `string`              | `''`                          | Class added to the container, after `svelte-lazy`                                                                  |
| `fadeOption`       | `object \| null`      | `{ delay: 0, duration: 400 }` | Options of the [fade](https://svelte.dev/docs/svelte/svelte-transition#fade) transition. `null` to disable it      |
| `onload`           | `(node) => void`      | `null`                        | Called with the container element when the content is loaded                                                       |
| `resetHeightDelay` | `number`              | `0`                           | Delay in ms before the container height becomes `auto` after loading                                               |

## How it works

- The content loads when the container scrolls within `offset` of the bottom of the viewport, or of its scroll container. Unless `keep` is set, it unloads after leaving, and the container gets its `height` back.
- If the content has an image, the placeholder stays until the image loads, then the container height becomes `auto`. If the image fails, the content shows with the fixed `height`.
- With server-side rendering, the server renders the placeholder; the content loads in the browser.

The DOM before loading:

```html
<div id="{id}" class="svelte-lazy {class}">
  <div class="svelte-lazy-placeholder">...</div>
</div>
```

and after:

```html
<div id="{id}" class="svelte-lazy {class}">
  <div class="svelte-lazy-content">...</div>
</div>
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development, tests and releases.
