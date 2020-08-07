const static = require('node-static')
const puppeteer = require('puppeteer')

const filePath = './test/auto'
const port = 3000
const file = new static.Server(filePath)

require('http').createServer((req, res) => {
  req.addListener('end', () => {
    file.serve(req, res)
  }).resume()
}).listen(port, () => {
  console.log(`Server listening on ${port}`)
  runBrowser()
})

async function runBrowser() {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  page.on('load', async () => {
    console.log('Page fully loaded')

    await page.evaluate(() => test())
    const [failed, errors] = await page.evaluate(
      () => [window.failed, window.errors]
    )
    const hasError = failed || errors && errors.length
    if (hasError) {
      console.log('✘ Failed', errors)
    } else {
      console.log('✔ Success')
    }

    await browser.close()
    process.exit(hasError ? 1 : 0)
  })

  page.on('console', msg => {
    console.log('Console:', msg.text())
  })

  page.on('pageerror', err => {
    console.log('Error:', err.toString())
  })

  await page.goto(`http://localhost:${port}/`)
}
