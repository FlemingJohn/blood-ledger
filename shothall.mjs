import { chromium } from 'playwright'

const to = process.argv[2] ?? 'hall.png'
const which = process.argv[3] ?? 'hall'

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1586, height: 992 }, deviceScaleFactor: 1 })
page.on('pageerror', (e) => console.log('  [pageerror] ' + e.message))
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })

const mounted = await page.evaluate(async (what) => {
  if (what === 'hall') {
    const made = await import('/src/pages/hall.ts')
    const part = made.buildHall({
      address: '0x7a3f000000000000000000000000000000009c2e',
      whenRoleAsked: () => null,
      whenDescending: () => undefined
    })
    document.body.replaceChildren(part.element)
    return 'hall'
  }
  const made = await import('/src/pages/patronTable.ts')
  const purse = {
    read: () => ({ standing: 'opened', address: '0xbeef000000000000000000000000000000001a12', chainNumber: 11155111, trouble: null }),
    open: async () => ({ standing: 'opened', address: '0xbeef000000000000000000000000000000001a12', chainNumber: 11155111, trouble: null }),
    moveToWantedRealm: async () => ({ standing: 'opened', address: '0xbeef000000000000000000000000000000001a12', chainNumber: 11155111, trouble: null }),
    watch: () => () => undefined
  }
  const part = made.buildPatronTable({ purse, address: '0xbeef000000000000000000000000000000001a12', whenRoleAsked: () => null })
  document.body.replaceChildren(part.element)
  return 'patron'
}, which)

console.log('mounted ' + mounted)
await page.waitForTimeout(6000)
await page.screenshot({ path: to, animations: 'disabled', timeout: 90000 })
console.log('wrote ' + to)
await browser.close()
