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

`docs/demo.gif` in the README is recorded from `demo/showcase.html`. To record it again, with [ffmpeg](https://ffmpeg.org/) installed:

```sh
npm run record:demo
```

## Publish

1. Bump the version in `package.json` and add the changes to `CHANGELOG.md`
2. Commit, then push a tag of the version:

   ```sh
   git tag v1.3.0
   git push origin v1.3.0
   ```

The [release workflow](.github/workflows/release.yml) checks, tests and publishes it to npm by [trusted publishing](https://docs.npmjs.com/trusted-publishers), with provenance.
