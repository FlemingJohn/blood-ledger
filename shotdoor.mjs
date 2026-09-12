import { chromium } from 'playwright'

const to = process.argv[2] ?? 'door.png'
const at = process.argv[3] ?? 'http://localhost:5180/'
const throwsCode = Number(process.argv[4] ?? -32002)

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1645, height: 956 } })

await page.addInitScript((code) => {
  window.ethereum = {
    isMetaMask: true,
    on: () => undefined,
    removeListener: () => undefined,
    async request({ method }) {
      if (method === 'eth_accounts') {
        return []
      }
      if (method === 'eth_chainId') {
        return '0x18e8f'
      }
      if (method === 'eth_requestAccounts') {
        const trouble = new Error('Already processing eth_requestAccounts. Please wait.')
        trouble.code = code
        throw trouble
      }
      return null
    }
  }
}, throwsCode)

await page.goto(at, { waitUntil: 'networkidle' })
await page.waitForSelector('.door', { timeout: 30000 })
await page.waitForTimeout(2500)

console.log('before: ' + (await page.textContent('.doorway__aside')))

await page.click('.door')
await page.waitForTimeout(1200)

console.log('word:   ' + (await page.textContent('.door__word')))
console.log('after:  ' + (await page.textContent('.doorway__aside')))
console.log('class:  ' + (await page.getAttribute('.doorway__aside', 'class')))

const box = await page.locator('.doorway').boundingBox()
await page.screenshot({
  path: to,
  clip: { x: box.x - 40, y: box.y - 20, width: box.width + 80, height: box.height + 60 }
})

console.log('wrote ' + to)
await browser.close()
