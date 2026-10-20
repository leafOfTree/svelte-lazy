<img src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg" width="60" alt="icon" align="left"/>

# svelte-lazy [![npm version][3]][4]

A svelte component to lazyload any content.

- [Demo on svelte.dev/repl][5]
- [Examples][7] and [their code][8]

<p align="center">
<img alt="demo image" src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/HEAD/svelte-lazy.png" width="120" />
</p>

## Installation

    npm i svelte-lazy

It works with Svelte 3, 4 and 5.

## Usage

```svelte
<script>
  import Lazy from 'svelte-lazy';
</script>

<Lazy height={300}>
  <img alt="" src="https://picsum.photos/id/412/200/300" />
</Lazy>
```

## Props

- **height**: _Number|String_. Default: `0` (px).
  - Height of the component before load.
  - **Set a proper value** to avoid scroll bounce. You can use the content height shown by the DevTools Inspector after loading.

- **keep**: _Boolean_. Default: `false`.
  - By default elements get unloaded after leaving view, set to `true` to keep all loaded ones after first appearance.

- **offset**: _Number_. Default: `150` (px).
  - Offset from the top of the component to the bottom of the viewport that triggers loading when in it.

- **placeholder**: _String|Component_. Default: `null`.
  - Placeholder before load.

- **placeholderProps**: _Object_. Default `null`.
  - Props for when using a component as a placeholder.

- **id**: _String_. Default: `undefined`.
  - Id for the container div. As the container div exists before load, links like `#id` can scroll to it and then load the content.

- **class**: _String_. Default: `''`.
  - Additional class for the container div. It will be `svelte-lazy ${class}`.

- **fadeOption**: _Object_. Default: `{ delay: 0, duration: 400 }`.
  - Option for the fade in transition. Set `null` to disable it.

- **onload**: _Function (node) => {}_. Default: `null`.
  - Function that is called when loaded.

- **resetHeightDelay**: _Number_. Default: `0` (milliseconds).
  - The delay to reset the component height to `auto` after loaded. Might be useful to wait for remote resources like images.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Life cycle

```
            enter viewport  / no image                 -> loaded
not loaded  -------------->
                            \ with image -> load event -> loaded
                                                |
                                                |
            show placeholder                    |     show content
```

## DOM structure

Before load

```html
<div id="${id}" class="svelte-lazy ${class}">
  <div class="svelte-lazy-placeholder">...</div>
</div>
```

After load

```html
<div id="${id}" class="svelte-lazy ${class}">
  <div class="svelte-lazy-content">...</div>
</div>
```

## Development

    git clone https://github.com/leafOfTree/svelte-lazy
    cd svelte-lazy
    npm i
    npm run dev

`npm run dev` serves the examples in `demo/` by Vite. `npm run build:demo` builds them to `demo/dist`, which is deployed to GitHub Pages.

Before committing:

    npm run lint      # ESLint and Prettier, `npm run format` to fix formatting
    npm run check     # type check by svelte-check

## Test

    npm test

Tests in `tests/` run in Chrome by [Vitest browser mode](https://vitest.dev/guide/browser/). They use the installed Chrome, so no browser is downloaded. To use another Chromium based browser, set its path:

    CHROME_PATH=/path/to/chromium npm test

Browser tests run with Svelte 5. To check that the component still compiles with Svelte 3 or 4:

    npm i --no-save svelte@4
    npm run check:svelte

## Publish

1. Bump the version in `package.json` and add the changes to `CHANGELOG.md`
2. Commit, then push a tag of the version:

       git tag v1.3.0
       git push origin v1.3.0

The [release workflow](.github/workflows/release.yml) checks, tests and publishes it to npm by [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance.

[3]: https://img.shields.io/npm/v/svelte-lazy.svg
[4]: https://www.npmjs.com/package/svelte-lazy
[5]: https://svelte.dev/repl/6d7714fa3cce4909af6c6d187271e0a1
[7]: https://leafoftree.github.io/svelte-lazy/
[8]: https://github.com/leafOfTree/svelte-lazy/blob/master/demo/index.svelte
