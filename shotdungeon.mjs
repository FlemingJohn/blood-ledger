import { chromium } from 'playwright'

const to = process.argv[2] ?? 'dungeon.png'
const at = process.argv[3] ?? 'http://localhost:5199/'
const seen = process.argv[4] === 'seen'

const who = '0x00000000000000000000000000000000deadbe02'

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: 1586, height: 992 } })

page.on('pageerror', (e) => console.log('  [pageerror] ' + String(e).slice(0, 200)))

await page.goto(at, { waitUntil: 'networkidle' })

if (seen) {
  await page.evaluate((w) => {
    window.localStorage.setItem(
      'blood-ledger:what-you-have-been-shown',
      JSON.stringify({ [w.toLowerCase()]: ['the dungeon'] })
    )
  }, who)
}

await page.evaluate(async (w) => {
  const made = await import('/src/pages/descent.ts')
  const part = made.buildDescent({
    address: w,
    seed: {
      seed: '0x9f2c4a71b3e8d5064af1c27e9b3d5a80cc14e7f2a6b9d3510e8c7f4a2b6d9e01',
      source: 'attested',
      attested: { height: 11694909, hash: '0x9f2c4a71b3e8d506', chainKey: 1 }
    },
    chosenClass: 'warrior',
    standing: 500,
    pact: {
      pactId: 99,
      patronAddress: '0x0000000000000000000000000000000000000001',
      coinsStaked: 500,
      patronShare: 40
    },
    whenSettled: () => undefined,
    whenWayOutOpens: () => undefined
  })
  const stage = document.getElementById('app') ?? document.body
  stage.replaceChildren(part.element)
}, who)

await page.waitForTimeout(9000)

console.log('tour prompt visible: ' + (await page.locator('.tourask').isVisible().catch(() => 'none')))

async function wherePlayerIs() {
  return page.evaluate(() => {
    const c = document.querySelector('.descent__board')
    if (!c) return null
    const ctx = c.getContext('2d')
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    let sum = 0
    for (let i = 0; i < d.length; i += 400) sum += d[i]
    return sum
  })
}

const before = await wherePlayerIs()
await page.keyboard.down('KeyD')
await page.waitForTimeout(1800)
await page.keyboard.up('KeyD')
const after = await wherePlayerIs()

console.log('canvas changed while holding D: ' + (before !== after) + '  (' + before + ' -> ' + after + ')')

await page.screenshot({ path: to })
console.log('wrote ' + to)
await browser.close()
