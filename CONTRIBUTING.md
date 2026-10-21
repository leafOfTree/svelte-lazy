# Contributing

## Development

```sh
git clone https://github.com/leafOfTree/svelte-lazy
cd svelte-lazy
npm i
npm run dev
```

`npm run dev` serves the examples in `demo/` by Vite. `npm run build:demo` builds them to `demo/dist`, which is deployed to GitHub Pages.

Before committing:

```sh
npm run lint    # ESLint and Prettier, `npm run format` to fix formatting
npm run check   # type check by svelte-check
```

## Build

```sh
npm run build
```

builds `index.js` (UMD) and `index.mjs` for tools that don't compile `.svelte` files, by Svelte 4 with its runtime inside, as in earlier versions. `npm test` and `npm pack` (so `npm publish` too) build them first.

## Compatibility

Most users are on 1.2.x and get later 1.x versions by `^1.2.x` without choosing to, so 1.x keeps what 1.2.11 had (see 1.4.1 in the changelog):

- `index.js` (UMD, global `Lazy`) and `index.mjs`, with the `main` and `module` fields, for tools that don't compile `.svelte` files from packages, like Jest 27 or a script tag. They're compiled by Svelte 4 with its runtime inside
- No `"type": "module"` in `package.json`, so `index.js` loads as a script. Node scripts and configs in this repository are `.mjs`
- `src/` compiles with Svelte 3, 4 and 5 (`npm run check:svelte`): no runes or snippets
- TypeScript types allow other props

Before a release that changes the package, compare it with the latest 1.2.x: `npm pack`, then install the tarball where 1.2.11 works, like a Jest 27 test, a script tag and Vite with Svelte 3, 4 and 5.

2.0 can drop these: Svelte 5 only with runes, no prebuilt files, with a migration note for tools that need to compile `.svelte` files.

`npm audit` reports advisories for `svelte4`, the Svelte 4 that builds the prebuilt files. They are fixed in Svelte 5 only, and don't apply to the prebuilt files: most are about server-side rendering, which they don't include, and the DOM clobbering one needs spread attributes on a form, which the component doesn't render. Users don't see them, as svelte-lazy has no dependencies. Building by Svelte 5 instead would change the runtime in the prebuilt files, so it waits for 2.0, which drops them.

## Test

```sh
npm test
```

Tests in `tests/` run in Chrome by [Vitest browser mode](https://vitest.dev/guide/browser/). They use the installed Chrome, so no browser is downloaded. To use another Chromium based browser, set its path:

```sh
CHROME_PATH=/path/to/chromium npm test
```

Browser tests run with Svelte 5. To check that the component still compiles with Svelte 3 or 4:

```sh
npm i --no-save svelte@4
npm run check:svelte
```

## Demo GIF

`docs/demo.gif` in the README is recorded from `demo/showcase.html`. To record it again, with [ffmpeg](https://ffmpeg.org/) and [ImageMagick](https://imagemagick.org/) installed:

```sh
npm run record:demo
```

## Playground link

The Playground link in the README has the code of `demo/playground/App.svelte` in it. After changing the file, print a new link and replace the one in the README:

```sh
npm run playground-link
```

## Publish

1. Bump the version in `package.json` and add the changes to `CHANGELOG.md`
2. Commit, then push a tag of the version:

   ```sh
   git tag v1.4.1
   git push origin v1.4.1
   ```

The [release workflow](.github/workflows/release.yml) checks, tests and publishes it to npm by [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance.

It picks the npm tag by the version:

- A prerelease like `2.0.0-next.0` goes to `next`, so only `npm i svelte-lazy@next` installs it
- A version of an older major, like `1.5.1` after 2.0, goes to `latest-1`, from the `1.x` branch
- Others go to `latest`
