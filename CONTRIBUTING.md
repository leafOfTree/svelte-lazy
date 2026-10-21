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

## Package

```sh
npm run package
```

packages `src/` to `dist/` by [`@sveltejs/package`](https://svelte.dev/docs/kit/packaging): the component without TypeScript, and its types. Then [publint](https://publint.dev/) checks `package.json`. `npm run check` and `npm pack` (so `npm publish` too) package it first.

## Compatibility

2.x needs Svelte 5, from 5.0.0 on:

- Use runes and snippets, but no features newer than 5.0.0, like `{@attach}` or class objects. `npm run check:svelte` compiles `dist/` with the installed Svelte; CI runs it with 5.0.0
- Keep `use:` actions and the `svelte-lazy`, `svelte-lazy-placeholder` and `svelte-lazy-content` classes, which users style

1.x, for Svelte 3 and 4, is on the [`1.x` branch](https://github.com/leafOfTree/svelte-lazy/tree/1.x), with its compatibility notes in its CONTRIBUTING.md. Fix 1.x there.

## Test

```sh
npm test
```

Tests in `tests/` run in Chrome by [Vitest browser mode](https://vitest.dev/guide/browser/). They use the installed Chrome, so no browser is downloaded. To use another Chromium based browser, set its path:

```sh
CHROME_PATH=/path/to/chromium npm test
```

Browser tests run with the latest Svelte. To check that the package compiles with the oldest Svelte 5:

```sh
npm run package
npm i --no-save svelte@5.0.0
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
   git tag v2.0.0-next.0
   git push origin v2.0.0-next.0
   ```

The [release workflow](.github/workflows/release.yml) checks, tests and publishes it to npm by [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance.

It picks the npm tag by the version:

- A prerelease like `2.0.0-next.0` goes to `next`, so only `npm i svelte-lazy@next` installs it
- A version of an older major, like `1.5.1` after 2.0, goes to `latest-1`, from the `1.x` branch
- Others go to `latest`
