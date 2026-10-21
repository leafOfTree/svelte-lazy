// Temporary: checks the examples site in an older WebKit without the
// scrollMargin option of IntersectionObserver, and in Chromium to compare
import { chromium, webkit } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.argv[2];
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpeg',
};
const server = createServer((req, res) => {
  let path = join(root, decodeURIComponent(req.url.split('?')[0]));
  if (path.endsWith('/')) path += 'index.html';
  if (!existsSync(path)) {
    res.statusCode = 404;
    return res.end();
  }
  res.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream');
  res.end(readFileSync(path));
}).listen(5400);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let failed = false;
const check = (name, ok, detail) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`);
  if (!ok) failed = true;
};

// BROWSERS=chromium CHROMIUM_PATH=... runs only Chromium, at that path
const browsers = { webkit, chromium };
const names = process.env.BROWSERS?.split(',') ?? ['webkit', 'chromium'];
for (const name of names) {
  const browser = await browsers[name].launch(
    name === 'chromium' && process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
  );
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const state = () =>
    page.evaluate(() => {
      const items = [...document.querySelectorAll('.feed .svelte-lazy')];
      return {
        loaded: items
          .map((item, i) => (item.querySelector('.svelte-lazy-content') ? i : -1))
          .filter((i) => i >= 0),
        total: items.length,
      };
    });
  const scrollFeed = async (top) => {
    await page.evaluate((top) => (document.querySelector('.feed').scrollTop = top), top);
    // Longer than the 200ms throttle of the scroll check
    await sleep(800);
  };
  const go = async (tab) => {
    await page.goto(`http://localhost:5400/#${tab}`, { waitUntil: 'domcontentloaded' });
    await sleep(1200);
  };

  await go('any');
  const info = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    scrollMargin: 'scrollMargin' in IntersectionObserver.prototype,
  }));
  console.log(`\n== ${name}: ${info.userAgent}`);
  console.log(`scrollMargin: ${info.scrollMargin}`);
  if (name === 'webkit')
    check('WebKit has no scrollMargin, so it checks on scroll', !info.scrollMargin);

  // Any content: only the items in view of the scroll container load
  let s = await state();
  check(
    'any: first item loads, items below the feed do not',
    s.loaded.includes(0) && !s.loaded.includes(s.total - 1),
    JSON.stringify(s.loaded),
  );
  await scrollFeed(100000);
  s = await state();
  check(
    'any: last item loads at the bottom, first item unloads',
    s.loaded.includes(s.total - 1) && !s.loaded.includes(0),
    JSON.stringify(s.loaded),
  );
  await page.screenshot({ path: `${name}-any-bottom.png` });
  await scrollFeed(0);
  s = await state();
  check(
    'any: first item loads again at the top',
    s.loaded.includes(0) && !s.loaded.includes(s.total - 1),
    JSON.stringify(s.loaded),
  );

  // Keep: items stay loaded after scrolling through them all
  await go('keep');
  const height = await page.evaluate(() => document.querySelector('.feed').scrollHeight);
  for (let top = 0; top <= height; top += 200) {
    await scrollFeed(top);
  }
  await scrollFeed(0);
  s = await state();
  check(
    'keep: all items stay loaded after scrolling through',
    s.loaded.length === s.total,
    `${s.loaded.length} / ${s.total}`,
  );

  // Long list: only rows in view load
  await go('long');
  await page.evaluate(() =>
    document.querySelectorAll('.feed .svelte-lazy')[500].scrollIntoView({ block: 'center' }),
  );
  await sleep(800);
  s = await state();
  check(
    'long: row 500 loads, and only a few rows',
    s.loaded.includes(500) && s.loaded.length < 30,
    JSON.stringify(s.loaded),
  );
  await page.screenshot({ path: `${name}-long.png` });

  // Filter: matches in view load; after clearing, items moved out of view unload
  await go('filter');
  const before = await state();
  await page.fill('input', 'a');
  await sleep(800);
  const filtered = await state();
  await page.fill('input', '');
  await sleep(800);
  const cleared = await state();
  check(
    'filter: loads after filtering, and unloads after clearing',
    filtered.loaded.length >= 1 && cleared.loaded.length <= before.loaded.length + 1,
    `before ${before.loaded.length}, filtered ${filtered.loaded.length}/${filtered.total}, cleared ${cleared.loaded.length}/${cleared.total}`,
  );
  await page.screenshot({ path: `${name}-filter.png` });

  check('no page errors', errors.length === 0, errors.join('; '));
  await browser.close();
}
server.close();
process.exit(failed ? 1 : 0);
