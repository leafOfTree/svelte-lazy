# Changelog

## Unreleased

- Remove the prebuilt `index.js` and `index.mjs`. The package exports `src/index.svelte` by the `svelte` condition, so bundlers compile it with your Svelte version
- Add the `types` condition to `exports`
- Test in the browser with Vitest, and compile with Svelte 3 and 4 in CI
- Publish from GitHub Actions with npm provenance

## 1.3.0

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
