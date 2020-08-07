const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

// window.addEventListener('load', test)

async function test() {
  console.log('Start test')
  setup()

  const container = document.querySelector('.container')

  scroll(container, 0)

  await testTop()
  await testBasic()
  await testExtend()
  await testAnyContent()

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
      assert(elem.classList.value, 'svelte-lazy basic')

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
    }  
  }

  // Test Lazy at top of page
  async function testTop() {
    console.log(`Test top -----------------`)
    const elem = document.querySelector('.top')
    const height = '300'
    const offset = '150'
    if (elem) {
      assert(elem.style.height, 'auto')
    }  
  }

  // Test height, placeholder, class, transition, onload
  async function testExtend() {
    console.log('Test extend -----------------')
    const elem = document.querySelector('.extend')
    const transitionClass = '.extend .svelte-lazy-transition'
    const height = '300'
    const offset = '300'
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading Component')
      assert(elem.classList.value, 'svelte-lazy extend')
      assert(document.querySelector(transitionClass), null)
      assert(window.extend.onload, false)

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading Component')

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
      assert(document.querySelector(transitionClass), null)
      assert(window.extend.onload, true)
    } 
  }

  // Test any content in Lazy
  async function testAnyContent() {
    console.log('Test any content -----------------')
    const elem = document.querySelector('.any-content')
    const transitionClass = '.any-content .svelte-lazy-transition'
    const height = '300'
    const offset = '150'
    if (elem) {
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')
      assert(elem.classList.value, 'svelte-lazy any-content')
      assert(document.querySelector(transitionClass), null)

      // Not in offset
      await scroll(container, elem.offsetTop - container.clientHeight - offset)
      assert(elem.style.height, `${height}px`)
      assert(elem.textContent, 'Loading...')

      // In offset
      await scroll(container, elem.offsetTop - container.clientHeight)
      assert(elem.style.height, 'auto')
      assert(elem.textContent, 'Any content can be here.')
      assert(!!document.querySelector(transitionClass), true)
    } 
  }
}

function setup() {
  console.log('Setup test')
  window.failed = false
  window.errors = []
}

function assert(result, expected) {
  console.log(`Assert ${result} to be ${expected}`)
  if (result !== expected) {
    const err = `Expected ${expected}, but got ${result}`
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
