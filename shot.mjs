import { chromium } from 'playwright'

const at = process.argv[2] ?? 'http://localhost:5199/'
const to = process.argv[3] ?? 'shot.png'
const wide = Number(process.argv[4] ?? 1645)
const tall = Number(process.argv[5] ?? 956)

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
const page = await browser.newPage({ viewport: { width: wide, height: tall }, deviceScaleFactor: 1 })

const said = []
page.on('console', (one) => { if (one.type() === 'error') said.push(one.text()) })
page.on('pageerror', (one) => said.push(String(one)))

await page.goto(at, { waitUntil: 'networkidle' })
await page.waitForSelector('.hero__carved', { timeout: 30000 }).catch(() => console.log('NO CANVAS after 30s'))
await page.waitForTimeout(4000)

const measured = await page.evaluate(() => {
  const doc = document.documentElement
  const hero = document.querySelector('.hero')
  const canvas = document.querySelector('.hero__carved')
  const centre = document.querySelector('.centre')
  const box = (el) => {
    if (!el) return 'missing'
    const r = el.getBoundingClientRect()
    return `y ${Math.round(r.top)}..${Math.round(r.bottom)}  h ${Math.round(r.height)}`
  }
  return {
    viewport: `${doc.clientWidth}x${doc.clientHeight}`,
    scrollHeight: doc.scrollHeight,
    scrolls: doc.scrollHeight > doc.clientHeight ? `YES by ${doc.scrollHeight - doc.clientHeight}px` : 'no',
    hero: box(hero),
    canvas: box(canvas),
    centre: box(centre),
    stillOpacity: getComputedStyle(document.querySelector('.hero__still') ?? document.body).opacity,
    gaps: [...document.querySelectorAll('.centre > *')].map((c) => {
      const r = c.getBoundingClientRect()
      const name = c.getAttribute('class') || c.tagName
      return name + '  h' + Math.round(r.height) + '  top' + Math.round(r.top)
    })
  }
})

console.log(JSON.stringify(measured, null, 2))
if (said.length) console.log('CONSOLE ERRORS:\n  ' + said.join('\n  '))

await page.screenshot({ path: to })

console.log('wrote ' + to)

const { execFileSync } = await import('node:child_process')
try {
  console.log(execFileSync('python', ['compare.py', to], { encoding: 'utf-8' }))
} catch (why) {
  console.log('compare skipped')
}

await browser.close()
