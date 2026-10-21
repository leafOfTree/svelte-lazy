<img src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg" width="60" alt="icon" align="left"/>

# svelte-lazy

[![npm version](https://img.shields.io/npm/v/svelte-lazy.svg)](https://www.npmjs.com/package/svelte-lazy)
[![CI](https://github.com/leafOfTree/svelte-lazy/actions/workflows/node.js.yml/badge.svg)](https://github.com/leafOfTree/svelte-lazy/actions/workflows/node.js.yml)

A Svelte component to lazy load any content: images, videos, components or anything else. It shows a placeholder until the content scrolls into view, and fades it in.

Native `loading="lazy"` covers images and iframes. svelte-lazy also defers rendering any markup or component, keeps the layout stable while images load, and works in scroll containers.

<p align="center">
  <img alt="Demo: cards show a placeholder, then load as they scroll into view" src="https://raw.githubusercontent.com/leafOfTree/svelte-lazy/master/docs/demo.gif" width="640" />
</p>

> [!NOTE]
> This is the README of 2.0, in prerelease: `npm i svelte-lazy@next`. It needs Svelte 5. For Svelte 3 or 4, use 1.x: `npm i svelte-lazy@1`, and see [its README](https://github.com/leafOfTree/svelte-lazy/tree/1.x#readme). To upgrade, see [Migrating from 1.x](#migrating-from-1x).

[Live examples](https://leafoftree.github.io/svelte-lazy/) ([source](https://github.com/leafOfTree/svelte-lazy/tree/master/demo)) · [Try it in the Svelte Playground][playground]

## Install

```sh
npm i svelte-lazy
```

It needs Svelte 5, and comes with TypeScript types. For Svelte 3 or 4, use 1.x: `npm i svelte-lazy@1`.

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

Load only once, with a snippet as the placeholder:

```svelte
<script>
  import Lazy from 'svelte-lazy';
  import Spinner from './Spinner.svelte';
</script>

<Lazy height={400} keep>
  {#snippet placeholder()}
    <Spinner size="large" />
  {/snippet}
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

Other attributes, like `style`, `data-*` and `aria-*`, go to the container:

```svelte
<Lazy height={300} data-id={photo.id} aria-label={photo.name}>...</Lazy>
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

| Prop               | Type                | Default                       | Description                                                                                                        |
| ------------------ | ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `height`           | `number \| string`  | `0`                           | Height of the container before loading, in px or any CSS length like `'50vh'`                                      |
| `keep`             | `boolean`           | `false`                       | Keep the content after it leaves the viewport, instead of unloading it                                             |
| `offset`           | `number`            | `150`                         | Load when the top of the container is within this many px below the bottom of the viewport or the scroll container |
| `placeholder`      | `string \| Snippet` | `null`                        | Shown before loading, and while images in the content are loading                                                  |
| `id`               | `string`            | `undefined`                   | `id` of the container                                                                                              |
| `class`            | `string`            | `''`                          | Class added to the container, after `svelte-lazy`                                                                  |
| `fadeOption`       | `object \| null`    | `{ delay: 0, duration: 400 }` | Options of the [fade](https://svelte.dev/docs/svelte/svelte-transition#fade) transition. `null` to disable it      |
| `onload`           | `(node) => void`    | `null`                        | Called with the container element when the content is loaded                                                       |
| `resetHeightDelay` | `number`            | `0`                           | Delay in ms before the container height becomes `auto` after loading                                               |

## How it works

- The content loads when the container comes within `offset` of the bottom of the viewport, or of its scroll container, by scrolling or by a layout change. Unless `keep` is set, it unloads after leaving, and the container gets its `height` back. It's checked by [`IntersectionObserver`](https://developer.mozilla.org/docs/Web/API/IntersectionObserver), so nothing runs on scroll.
- If the content has an image, the placeholder stays until the image loads, then the container height becomes `auto`. If the image fails, the content shows with the fixed `height`. Only the first image of the content is waited for: use `resetHeightDelay` to wait longer for others.
- With server-side rendering, the server renders the placeholder; the content loads in the browser.
- Only vertical scrolling is checked: in a horizontal scroll container, content loads by its vertical position.

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

## Migrating from 1.x

- 2.0 needs Svelte 5. With Svelte 3 or 4, stay on 1.x
- A component placeholder becomes a snippet, and `placeholderProps` is gone:

  ```svelte
  <!-- 1.x -->
  <Lazy placeholder={Spinner} placeholderProps={{ size: 'large' }}>...</Lazy>

  <!-- 2.0 -->
  <Lazy>
    {#snippet placeholder()}
      <Spinner size="large" />
    {/snippet}
    ...
  </Lazy>
  ```

- The package has no prebuilt `index.js` and `index.mjs`. Bundlers that compile `.svelte` files from packages, like Vite and SvelteKit, work as before. Tools that don't, like Jest 27 or a script tag, need to, or stay on 1.x

See the [changelog](CHANGELOG.md) for the other changes.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development, tests and releases.

[playground]: https://svelte.dev/playground/untitled#H4sIAAAAAAAAA41W3Y7bNhZ-lQOlheVGluQZd2aikRxkC_Qquxsgze5FnAtKOrLY0qSWpOw4hu_3eh9xn6QgqT-PjbYYzAzF8_H8fueQJ4-THXqJp_bINC4Y-Xb0Aq-iDJWXfD55-tgYsdnwgh78rmlCd8ALvJwovLVfCK6Ra-UlXqoKSRu93nAAumuE1PCefDtCJcUOZhPTs-cNN6Aogg-10EI5yCeuGkZUDfkRDuQIooL3QuIOPtBCtTtzohBcaWjcoQw-mz2AExjPEpj9izCGx1kAtExgGa_u4Ry8gHzUkhxylJKiGoBP8TXw51-FLAfE8sdrxId2O8jvbsh_QdLJ726J_02YbCc-rG44y8VhANw_XAP-hkR2gNV9H-2XMb2_1AiMaFQamCClAsJLaLldB8DxYCQVlUoHVlSLA-wIPwKRaE9gCVwcjDaGGnBvSg0ZfKc00eh__jJ_7mUO_Q9xGMXxKC1EyzVkED-PZWRiCxn4hnuBDWgO2RpOLkR34HUGy2e3Mdj-fAKeOHkA42E4BxCGoYN9CRWjBfpxAE_OifOYlNSwcg01UcBFlw0oCGM5KX5L4EB0UYOuETpuA0OyR7tTIZZGS9XyQlPBHfiTS6hvpPMxABOjyBXKPUrITLbh760m5tw_u23fl1gIWapp6ACVkOA7BU5uemFADrALIBcljrBQ4k7sTT1KvDwCQCvwDTosGFHqPVX6bWhCJZQrf9qniy4Bs_kLDWBq589c6maBtR3-p0V5_IgMCy2kP2tm87ehxq_6J6dk_jzVcB4_huWwmFLJ5PRS9TvG_Fl4082QId_qurN07k32RQi7hS1UACcoaspKk4AEtGwxANXmWiK6z1GBRN1KDicoUWkpjgn4tmCD4pKqQnCOhfbnlmo2mjQaJuKGpztCuZ2NqUJHHpv_bONZVnnQKkymfFp3zf4KSVH3Q48otwLf_gtpOR_yZokNNdJtrbPT8s3DGURVKdTZKT5Dw0iBtWAlymzjvRekpHwbhuHGA2ENZicXla1tV1lnxDbneT3WLKW7LRCms9MIOIOSRbbxaq0blURRY6d26PyOaBmdeo_P0SqOo7tVvPEgmmpt1lN9adQMwjSyTdtlJDIZsWGnUZfMtWvvlChaYodL6-V6wpM0qpe9pBmSX1OuN976YyEFY7bJmSVEl287HCiHPcVDMBmfcKiRG_jRjYfR2bSk-0G7HVMbb30aOH2GCFyUqqPreTJp06ik-15Ry4b4OxJ0Q5AotwLf_gv5fNJPKaOd-ZOTmhk5LZ7RRisYhZBlGbiKny_bPM3Xr9MoX0OnytU5LUSJa0eaNLIfF9oTZAqvNf3_v_-71uWy6abqoCCi1TSgiNExEWPtjaRLURr1dU-jrs82PFX6yJxrZq8fYSU1z4xjAhXDr12Dm-XiIEmTgPnb7W7N992qGVCC60VFdpQdE1BHpXG3aGkAinC1UChp1Xc-QGiaujd5oKWuE7h7igddrksTWN2Ne2KPsmLisDgmQFotuu2GlKZVE4hhOTqTC1miTGDZfAUlGC1BbnN_efcI_W8EcbiaX8AXkpS0VcmoaOJssmUiJ8yfztZh8O-I3FLuDna3-LXSeOLd14WqSSkOxm3zY_y85eH9fPQj-gHeKajptjYU769gQjlKyLES3aOE8m0ASgAXuqZ8C-amU_BD9Meh9NfEPPgT3GRQDuH35Vq-eRhiHOqyvLuMm36z2112cvGXMn3T7MDVraRlb9bgFlTjTiVQINcoe_40pKD6mEAcPowmzah-qS5novjt-YKcyzj-_gU3l6sJN_NfsdCLimrz9toPNl9Q4OmaVs0VhWJDoYFEtqsOncmHOB7P257uT5sWTYbX4I7yRd9VcTw1Wi9f2jPsu6S7mfm3UMuxuJNcPk5OumfpaeK5ot_QOHE5Jfp4HuM-zEIwIRN49Vj8WFTV89T4Ihdai92L7LXsysWrgdBtmBtrYaddAlxwHLY5LoZiTuNgNOG6Xtj3j8_hNawGyt0mUX5FIcqt-ltMwt0kY_ayzMdXscvCkjxW99PEdrfqtRMTkLlpXiq6L5_yapi7adTPfC_wzOPTS8xL7vwl8DSh7EB56SUVMdfT7yn2q8cUDwAA
