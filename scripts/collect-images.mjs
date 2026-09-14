import { chromium } from 'playwright'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/* Everything a submission form might want, gathered outside the repo so it can
   be pasted by hand. Nothing here is referenced by the docs any more. */
const out = 'D:\\Hack\\buidl-images'

mkdirSync(out, { recursive: true })

const browser = await chromium.launch()

/* the banner is an SVG, and forms want a PNG */
const banner = readFileSync('docs/banner.svg', 'utf8')
const page = await browser.newPage({ viewport: { width: 1600, height: 400 } })
await page.setContent(
  `<style>html,body{margin:0;background:#08040a}svg{display:block;width:1600px;height:auto}</style>${banner}`
)
await page.waitForTimeout(300)
const shot = await page.locator('svg').screenshot()
const { writeFileSync } = await import('node:fs')
writeFileSync(join(out, '00-banner.png'), shot)
await page.close()
await browser.close()

const taken = [['00-banner.png', 'the wordmark, for a header or cover']]

const screens = [
  ['landing.png', '01-screen-landing.png', 'the landing'],
  ['hall.png', '02-screen-hall.png', 'the hall of patrons'],
  ['patron.png', '03-screen-patron.png', "the patron's table"],
  ['dungeon.png', '04-screen-dungeon.png', 'the dungeon'],
  ['profile.png', '05-screen-profile.png', 'your record'],
  ['reckoning.png', '06-screen-reckoning.png', 'the reckoning']
]

for (const [from, to, what] of screens) {
  copyFileSync(join('docs/shots', from), join(out, to))
  taken.push([to, what])
}

copyFileSync('public/icon.png', join(out, '07-logo-512.png'))
taken.push(['07-logo-512.png', 'the project logo, square, for an avatar'])

if (existsSync('docs/deck')) {
  for (const file of readdirSync('docs/deck').filter((one) => one.startsWith('slide-'))) {
    const to = 'deck-' + file.replace('slide-', '')
    copyFileSync(join('docs/deck', file), join(out, to))
    taken.push([to, 'deck slide ' + file.slice(6, 8)])
  }
  if (existsSync('docs/deck/blood-ledger-deck.pdf')) {
    copyFileSync('docs/deck/blood-ledger-deck.pdf', join(out, 'blood-ledger-deck.pdf'))
    taken.push(['blood-ledger-deck.pdf', 'the whole deck, 12 slides'])
  }
}

console.log('')
console.log('  ' + out)
console.log('')
for (const [name, what] of taken) {
  console.log('  ' + name.padEnd(26) + what)
}
console.log('')
console.log('  ' + taken.length + ' files')
