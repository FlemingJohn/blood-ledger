import { chromium } from 'playwright'

const to = process.argv[2] ?? 'short.png'
const at = process.argv[3] ?? 'http://localhost:5180/'
const holds = process.argv[4] ?? '0x0'

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1645, height: 956 } })

const you = '0xa29b082aa8d9e7d4f27462595438ff271b86b0d0'

await page.addInitScript(
  ({ you, holds }) => {
    window.ethereum = {
      isMetaMask: true,
      on: () => undefined,
      removeListener: () => undefined,
      async request({ method }) {
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') {
          return [you]
        }
        if (method === 'eth_chainId') {
          return '0xaa36a7'
        }
        if (method === 'eth_getBalance') {
          return holds
        }
        return null
      }
    }
  },
  { you, holds }
)

await page.goto(at, { waitUntil: 'networkidle' })

await page.evaluate(async (you) => {
  const made = await import('/src/pages/patronTable.ts')
  const reading = { standing: 'opened', address: you, chainNumber: 11155111, trouble: null }
  const purse = {
    read: () => reading,
    open: async () => reading,
    moveToWantedRealm: async () => reading,
    watch: () => () => undefined
  }
  const part = made.buildPatronTable({ purse, address: you, whenRoleAsked: () => null })
  document.body.replaceChildren(part.element)
}, you)

await page.waitForTimeout(3500)

const short = await page.locator('.stake__short')
console.log('warning shown: ' + (await short.isVisible()))
if (await short.isVisible()) {
  console.log('warning text:  ' + (await short.textContent()))
}
console.log('house button:  ' + (await page.locator('.stake__mend').first().isVisible()))
console.log('stake button disabled: ' + (await page.locator('.door--stake').isDisabled()))

const box = await page.locator('.stake, .panel').first().boundingBox()
await page.screenshot({
  path: to,
  clip: { x: box.x - 10, y: box.y - 10, width: Math.min(box.width + 20, 700), height: Math.min(box.height + 20, 700) }
})

console.log('wrote ' + to)
await browser.close()
