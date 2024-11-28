const express = require('express')
const path = require('path')
const puppeteer = require('puppeteer')

const app = express()
const port = 3000
const filePath = './test/auto'

// Serve static files
app.use(express.static(filePath))

// Special handling for delay.jpg
app.get('/delay.jpg', (req, res) => {
    setTimeout(() => {
        console.log('Replace delay.jpg with p2.jpg after 2s')
        res.sendFile(path.join(__dirname,'p2.jpg'))
    }, 2000)
})

// Error handling
app.use((err, req, res, next) => {
    console.error('Error serving ' + req.url + ' - ' + err.message)
    next(err)
})

// Start server
app.listen(port, () => {
    console.log(`Server listening on ${port}`)
    runBrowser()
})

async function runBrowser() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
  })
  const page = await browser.newPage()
  await page.setViewport({
    width: 800, 
    height: 800, 
  })

  page.on('load', async () => {
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
