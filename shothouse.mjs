import { chromium } from 'playwright'

const to = process.argv[2] ?? 'house.png'
const at = process.argv[3] ?? 'http://localhost:5199/'

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1586, height: 992 } })

const bare = '0x00000000000000000000000000000000deadbe01'

await page.goto(at, { waitUntil: 'networkidle' })

await page.evaluate(async (who) => {
  const made = await import('/src/pages/hall.ts')
  const part = made.buildHall({
    address: who,
    whenRoleAsked: () => null,
    whenDescending: () => undefined
  })
  const stage = document.getElementById('app') ?? document.body
  stage.replaceChildren(part.element)
}, bare)

await page.waitForTimeout(9000)

const slip = page.locator('.housepurse')
console.log('house slip opened on its own: ' + (await slip.isVisible()))

if (await slip.isVisible()) {
  console.log('--- what it says ---')
  console.log((await slip.innerText()).split('\n').map((l) => '  ' + l).join('\n'))
}

await page.screenshot({ path: to })
console.log('wrote ' + to)
await browser.close()
