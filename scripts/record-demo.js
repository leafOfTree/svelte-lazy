// Record demo/showcase.html into docs/demo.gif:
//   npm run record:demo
// Needs ffmpeg. Uses the installed Chrome, or the browser at CHROME_PATH.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const WIDTH = 640;
const HEIGHT = 440;
const OUTPUT = 'docs/demo.gif';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// /slow/tea.jpg is demo/public/media/tea.jpg after a delay, like a slow network
function slowImages() {
  return {
    name: 'slow-images',
    configureServer(server) {
      server.middlewares.use('/slow/', (req, res) => {
        const name = req.url.replace(/^\//, '').replace(/\?.*/, '');
        setTimeout(() => {
          res.setHeader('Content-Type', 'image/jpeg');
          res.end(readFileSync(join('demo/public/media', name)));
        }, 700);
      });
    },
  };
}

const server = await createServer({
  configFile: 'vite.config.js',
  plugins: [slowImages()],
  server: { port: 0 },
  logLevel: 'error',
});
await server.listen();
const url = server.resolvedUrls.local[0];

const executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(executablePath ? { executablePath } : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await page.goto(`${url}showcase.html`);
await page.waitForSelector('.feed');

// Take screenshots as fast as possible, with the time of each
const dir = mkdtempSync(join(tmpdir(), 'svelte-lazy-demo-'));
const frames = [];
let recording = true;
const capture = (async () => {
  while (recording) {
    const file = join(dir, `${String(frames.length).padStart(4, '0')}.png`);
    await page.screenshot({ path: file });
    frames.push({ file, time: Date.now() });
  }
})();

await sleep(1500);
// Scroll the feed one card at a time, then hold at the end
await page.evaluate(async () => {
  const feed = document.querySelector('.feed');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  while (feed.scrollTop + feed.clientHeight < feed.scrollHeight - 1) {
    const from = feed.scrollTop;
    const start = performance.now();
    for (let t = 0; t < 1; t = (performance.now() - start) / 500) {
      feed.scrollTop = from + 202 * ease(t);
      await new Promise(requestAnimationFrame);
    }
    feed.scrollTop = from + 202;
    await wait(1000);
  }
});
await sleep(1200);
recording = false;
await capture;
await browser.close();
await server.close();

// Each frame lasts until the next one, so the GIF plays in real time
const list = frames
  .map(({ file, time }, i) => {
    const next = frames[i + 1]?.time ?? time + 1000;
    return `file '${file}'\nduration ${(next - time) / 1000}`;
  })
  .join('\n');
const listFile = join(dir, 'frames.txt');
writeFileSync(listFile, `${list}\nfile '${frames.at(-1).file}'\n`);

execFileSync('ffmpeg', [
  '-y',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  listFile,
  '-vf',
  'fps=12,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle',
  '-loop',
  '0',
  OUTPUT,
]);
rmSync(dir, { recursive: true });
console.log(`${OUTPUT}: ${frames.length} frames`);
