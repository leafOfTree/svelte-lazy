import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';

// A 1x1 PNG
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

// Images for tests: /img/ok.png, /img/slow.png (after 1s), others are 404
function testImages() {
  return {
    name: 'test-images',
    configureServer(server) {
      server.middlewares.use('/img/', (req, res) => {
        const send = () => {
          res.setHeader('Content-Type', 'image/png');
          res.end(png);
        };
        if (req.url === '/ok.png') {
          send();
        } else if (req.url === '/slow.png') {
          setTimeout(send, 1000);
        } else {
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

// Use the installed Chrome, or the browser at CHROME_PATH, so no browser is
// downloaded
const executablePath = process.env.CHROME_PATH;

export default defineConfig({
  plugins: [svelte(), testImages()],
  test: {
    include: ['tests/**/*.test.js'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        launchOptions: executablePath ? { executablePath } : { channel: 'chrome' },
      }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
