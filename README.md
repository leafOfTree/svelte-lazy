<img src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/master/svelte-lazy.svg" width="60" height="60" alt="icon" align="left"/>

# svelte-lazy [![npm version][3]][4]

A svelte component to lazyload any content including images. [Demo on svelte.dev/repl][5]. 

<p align="center">
<img alt="demo image" src="https://raw.githubusercontent.com/leafOfTree/leafOfTree.github.io/HEAD/svelte-lazy.png" width="120" />
</p>

## Installation

    npm i svelte-lazy

For sapper server-side rendering which requires [using external components][6], install it to `devDependencies`:

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

## Props

- **height**: *Number|String*. Default: `0` (px for Number).
    - Height of the component before load. 
    - **Set a proper value** to avoid scroll bounce. One way is to use the content height which can be measured by the inspector in the devTool after load.

- **offset**: *Number*. Default: `150` (px). 
    - Offset from the top of the component to the bottom of the viewport that triggers loading when in it.

- **placeholder**: *String|Component*. Default: `null`. 
    - Placeholder before load.

- **placeholderProps**: *Object*. Default `null`. 
    - Props for when using a component as a placeholder.

- **class**: *String*. Default: `''`. 
    - Additional class for the container div. It will be `svelte-lazy ${class}`.

- **fadeOption**: *Object*. Default: `{ delay: 0, duration: 400 }`. 
    - Option for the fade in transition. Set `null` to disable it.

- **onload**: *Function (node) => {}*. Default: `null`. 
    - Function that is called when loaded.

- **resetHeightDelay**: *Number*. Default: `0` (milliseconds). 
    - The delay to reset the component height to `auto` after loaded. Might be useful to wait for remote resources like images.

## Changelog

v0 -> v1.0

- Adjust dom structure
- Optimize image loading

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
<div class="svelte-lazy ${class}">
    <div class="svelte-lazy-placeholder">...</div>
</div>
```

After load
```html
<div class="svelte-lazy ${class}">
    <div class="svelte-lazy-content">...</div>
</div>
```

## Development

    git clone https://github.com/leafOfTree/svelte-lazy
    cd svelte-lazy
    npm i
    npm start

## Test

    npm test

## Publish

For maintenance, bump the version in `package.json` then run `npm publish`.

## Refs

Based on [sveltejs/component-template: A base for building shareable Svelte components](https://github.com/sveltejs/component-template)

[1]: https://travis-ci.com/leafOfTree/svelte-lazy.svg?branch=master
[2]: https://travis-ci.com/leafOfTree/svelte-lazy
[3]: https://img.shields.io/npm/v/svelte-lazy.svg
[4]: https://www.npmjs.com/package/svelte-lazy
[5]: https://svelte.dev/repl/6d7714fa3cce4909af6c6d187271e0a1
[6]: https://github.com/sveltejs/sapper-template#using-external-components
