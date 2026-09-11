import { chromium } from 'playwright'

const to = process.argv[2] ?? 'eyes.png'
const at = process.argv[3] ?? 'http://localhost:5199/'

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1645, height: 956 }, deviceScaleFactor: 3 })

await page.goto(at, { waitUntil: 'networkidle' })
await page.waitForSelector('.hero__carved', { timeout: 30000 })
await page.waitForTimeout(4000)

await page.screenshot({ path: to, clip: { x: 640, y: 40, width: 380, height: 330 } })

console.log('wrote ' + to)
await browser.close()
