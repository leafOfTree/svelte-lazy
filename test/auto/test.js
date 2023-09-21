const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

// window.addEventListener('load', test)

async function test() {
  setup()

  const container = document.querySelector('.container')

  scroll(container, 0)

  await testTop()
  await testBasic()
  await testExtend()
  await testCustomProps()
  await testAnyContent()
  await testImg404()
  await testImgDelay()
  await testEmptyPlaceholder()

  showResult()

  // Test height, placeholder, class
  async function testBasic() {
    console.log('Test basic -----------------')
    const elem = document.querySelector('.basic')
    const height = 300
    const offset = 150
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')
      assert(elem.classList.contains('svelte-lazy'), true)
      assert(elem.classList.contains('basic'), true)

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')

      // In offset
      await sleep(500)
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
    }  
  }

  // Test Lazy at top of page
  async function testTop() {
    console.log(`Test top -----------------`)
    const elem = document.querySelector('.top')
    const height = 300
    const offset = 150
    if (elem) {
      assert(elem.style.height, 'auto')
    }  
  }

  // Test height, placeholder, class, onload
  async function testExtend() {
    console.log('Test extend -----------------')
    const elem = document.querySelector('.extend')
    const height = 300
    const offset = 300
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading Component')
      assert(elem.classList.contains('extend'), true)
      assert(window.extend.onload, false)

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading Component')

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
      assert(window.extend.onload, true)
    } 
  }

  // Test custom props
  async function testCustomProps() {
    console.log('Test custom props -----------------')
    const elem = document.querySelector('.custom-props')
    if (elem) {
      assert(elem.textContent, 'Loading Custom')
    }
  }

  // Test any content in Lazy
  async function testAnyContent() {
    console.log('Test any content -----------------')
    const elem = document.querySelector('.any-content')
    const height = 300
    const offset = 150
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')
      assert(elem.classList.contains('any-content'), true)

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
      assert(elem.textContent.trim(), 'Any content can be here.')
    } 
  }

  // Test img 404 error
  async function testImg404() {
    console.log('Test img 404 --------------------')
    const elem = document.querySelector('.img404')
    const height = 300
    const offset = 300
    if (elem) {
      assert(elem.style.height, `${height}px`)

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, `${height}px`)
    }
  }

  // Test image delay behavor / load event
  async function testImgDelay() {
    console.log('Test img delay --------------------')
    const elem = document.querySelector('.img-delay')
    const height = 300
    const offset = 300
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(!!elem.querySelector('.svelte-lazy-placeholder'), true)

      // In offset
      // Still show placeholder before image is loaded
      await scroll(container, elem.offsetTop - container.clientHeight)
      const contentElem = elem.querySelector('.svelte-lazy-content')
      assert(contentElem.style.display, 'none')
      assert(!!elem.querySelector('.svelte-lazy-placeholder'), true)
      
      // Show content after image is loaded
      await sleep(3000)
      assert(contentElem.style.display, '')
      assert(!!elem.querySelector('.svelte-lazy-placeholder'), false)
    }
  }

  // Test empty placeholder, it should not appear in DOM
  async function testEmptyPlaceholder() {
    console.log('Test empty placeholder --------------------')
    const elem = document.querySelector('.empty-placeholder')
    assert(!!elem.querySelector('.svelte-lazy-placeholder'), false)
  }
}

function setup() {
  window.failed = false
  window.errors = []
}

function assert(result, expected) {
  console.log(`Assert ${result} to be ${expected}`)
  if (result !== expected) {
    const err = `Expected [${expected}], but got [${result}]`
    addError(err)
    console.error('Error', err)
    throw new Error(err)
  } 
}

function addError(msg) {
  window.failed = true
  window.errors.push(msg)
}

function showResult() {
  if (window.failed || window.errors.length) {
    console.log('✘ Test failed', errors)
  } else {
    console.log('✔ Test successful')
  }
}

async function scroll(container, scrollTop) {
  container.scrollTop = scrollTop - 1 // '-1' for puppeteer chromium
  console.log('scroll to', container.scrollTop)
  await sleep(500)
}
