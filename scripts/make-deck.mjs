import { chromium } from 'playwright'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const page18 = 1280
const tall = 720

const source = pathToFileURL(resolve('docs/deck/deck.html')).href
const pdf = 'docs/deck/blood-ledger-deck.pdf'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: page18, height: tall } })

await page.goto(source, { waitUntil: 'networkidle' })

/* the webfonts have to be in before anything is measured or printed */
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(600)

const slides = await page.locator('.slide').count()

/* A slide whose content runs past its own frame prints with the bottom sliced
   off, and a footer sitting under a paragraph is the same bug one step earlier.
   Measure both rather than squint at twelve pages. */
const spilling = await page.evaluate((tall) => {
  const bad = []

  document.querySelectorAll('.slide').forEach((slide, at) => {
    const over = slide.scrollHeight - tall
    if (over > 1) {
      bad.push('slide ' + (at + 1) + ' overflows its frame by ' + over + 'px')
      return
    }

    const foot = slide.querySelector('.foot')
    if (!foot) {
      return
    }

    const top = foot.getBoundingClientRect().top
    slide.querySelectorAll('p, table, .card, .bars, pre, img').forEach((thing) => {
      if (thing.closest('.foot')) {
        return
      }
      const under = thing.getBoundingClientRect().bottom - top
      if (under > 2) {
        bad.push(
          'slide ' + (at + 1) + ': a ' + thing.tagName.toLowerCase() +
          ' runs ' + Math.round(under) + 'px into the footer'
        )
      }
    })
  })

  return bad
}, tall)

if (spilling.length > 0) {
  console.error('')
  spilling.forEach((one) => console.error('  ' + one))
  console.error('')
  await browser.close()
  process.exit(1)
}

await page.pdf({
  path: pdf,
  width: page18 + 'px',
  height: tall + 'px',
  printBackground: true,
  pageRanges: '1-' + slides,
  margin: { top: '0', right: '0', bottom: '0', left: '0' }
})

/* a PNG of each slide too, for anywhere that wants images instead */
for (let at = 0; at < slides; at += 1) {
  await page.locator('.slide').nth(at).screenshot({
    path: 'docs/deck/slide-' + String(at + 1).padStart(2, '0') + '.png'
  })
}

await browser.close()

console.log('  ' + slides + ' slides')
console.log('  ' + pdf)
console.log('  docs/deck/slide-01.png … slide-' + String(slides).padStart(2, '0') + '.png')
