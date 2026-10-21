# Changelog

## 2.0.0 (unreleased)

Svelte 5 only. For Svelte 3 or 4, stay on 1.x. See [Migrating from 1.x](README.md#migrating-from-1x) ([#58](https://github.com/leafOfTree/svelte-lazy/issues/58))

Breaking changes

- Needs Svelte 5: `peerDependencies` is `svelte: ^5.0.0`
- `placeholder` is a string or a snippet. Component placeholders and `placeholderProps` are removed: put the component in a `{#snippet placeholder()}`
- Remove the prebuilt `index.js` and `index.mjs`, and the `main` and `module` fields. Tools that don't compile `.svelte` files from packages, like Jest 27 or a script tag, need to, or stay on 1.x
- Without content, `<Lazy>` shows nothing, instead of "Lazy load content"
- Other props are attributes of the container div, and are type checked as attributes

New

- Other attributes, like `style`, `data-*` and `aria-*`, go to the container div

Load and unload by `IntersectionObserver` instead of checking each `<Lazy>` on scroll ([#57](https://github.com/leafOfTree/svelte-lazy/issues/57))

- Scroll faster with many items: nothing runs on scroll, the browser tells which ones come into view or leave
- Content now unloads when a layout change moves it out of view or hides it by `display: none`, like filtering or tabs, not only after scrolling
- No 200ms delay: content loads, and `onload` is called, as soon as it scrolls within `offset`
- A new `offset` applies right away
- In browsers without the `scrollMargin` option, like Safari before 26, content in scroll containers is still checked on scroll as before, so `offset` works there too

Package

- Written in TypeScript with runes and snippets, and packaged by `@sveltejs/package` to `dist/`, with types made from the source
- Add `"type": "module"`

## 1.4.1 (2026-10-21)

Compatibility with 1.3.0 and earlier:

- Bring back the prebuilt `index.js` (UMD) and `index.mjs` and their `main` and `module` fields, removed in 1.4.0. They are for tools that don't compile `.svelte` files from packages, like Jest 27 or a script tag. As before, they're compiled by Svelte 4 with its runtime inside. Bundlers that read the `svelte` condition, like Vite and SvelteKit, still use `src/index.svelte`
- Remove `"type": "module"` from `package.json`, as before 1.4.0, so `index.js` loads as a script
- TypeScript: allow other props, as before 1.4.0. The props above are still checked

## 1.4.0 (2026-10-21)

Fixes

- Fix loading in scroll containers: check the part of the window that scroll containers show. Content below a scroll container no longer loads on mount, content above it unloads, and scrolling another container no longer loads it
- `fadeOption={null}` now turns off the fade, as documented. Before, it faded in for 400ms
- Update the class when the `class` prop changes
- Unloading before `resetHeightDelay` no longer sets the height to `auto`
- Clear timers and image listeners on unload and destroy
- Fix TypeScript types with Svelte 5, where props weren't checked at all. Types now use `SvelteComponentTyped`, which works with Svelte 3, 4 and 5, and export `LazyProps`

Performance

- Scroll faster with many items: don't write the height of content that is already unloaded on each scroll, and find scroll containers only once
- With `keep`, stop listening to scroll once the content is loaded

Package

- Remove the prebuilt `index.js` and `index.mjs`. The package exports `src/index.svelte` by the `svelte` condition, so your bundler compiles it with your Svelte version. Vite, SvelteKit, rollup-plugin-svelte and svelte-loader support it
- Add the `types` condition to `exports`
- Publish from GitHub Actions with npm provenance

Development

- Test in the browser with Vitest, and compile with Svelte 3 and 4 in CI
- New examples site, demo GIF and Playground example

## 1.3.0 (2026-10-20)

- Add `id` prop for the container div, so links like `#id` can scroll to it before the content is loaded ([#18](https://github.com/leafOfTree/svelte-lazy/issues/18))
- Add `placeholderProps` and `id` to TypeScript types; allow component placeholders in types
- Test with Svelte 3, 4 and 5 in CI

## 1.2.11 (2024-11-28)

- Revert the Svelte 5 syntax migration in 1.2.10, so the component works with Svelte 3 and 4 again. It still works with Svelte 5
- Add `^5.0.0` to `svelte` peer dependencies

## 1.2.10 (2024-11-01)

- Migrate to Svelte 5 syntax (reverted in 1.2.11)

## 1.2.8, 1.2.9 (2024-09-24)

- Set npmjs registry for publish
- Upgrade dev dependencies: rollup 4, svelte 3.59, puppeteer 23

## 1.2.7 (2024-01-02)

- Export `src/index.svelte` instead of the build file

## 1.2.6 (2024-01-02)

- Add `svelte` export condition in `package.json`

## 1.2.5 (2023-12-02)

- Add `keep` to TypeScript types ([#28](https://github.com/leafOfTree/svelte-lazy/pull/28))

## 1.2.4 (2023-12-02)

- Add `keep` prop to keep loaded content after it leaves the viewport ([#27](https://github.com/leafOfTree/svelte-lazy/pull/27))

## 1.2.3 (2023-11-23)

- Fix showing the placeholder after filtering a list

## 1.2.2 (2023-10-15)

- Load content when it enters the viewport and unload it when it leaves
- Support Svelte 3 and 4 ([#22](https://github.com/leafOfTree/svelte-lazy/pull/22))

## 1.2.1 (2023-02-09)

- Prevent multiple calls of `onload`

## 1.2.0 (2023-02-09)

- Fix not loading content when filtering a long list

## 1.1.0 (2022-01-14)

- Refactor code for readability
- Fix not loading content on page change with routers like Routify or Sapper

## 1.0.12 (2021-09-13)

- Set the initial height of the container div immediately

## 1.0.11 (2021-09-12)

- Update docs

## 1.0.10 (2021-07-08)

- Fix error of `null` placeholder with SvelteKit

## Earlier versions

See [commits](https://github.com/leafOfTree/svelte-lazy/commits/master/). Main changes:

- v1.0: adjust DOM structure and optimize image loading
- Add `placeholderProps` for component placeholders (2020-12)
- Add `resetHeightDelay` prop (2020-06)
