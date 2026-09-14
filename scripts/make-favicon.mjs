import { chromium } from 'playwright'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const source = 'public/favicon.svg'
const out = 'public'

const sizes = [512, 256, 192, 180, 64, 32, 16]

const svg = readFileSync(source, 'utf8')

const browser = await chromium.launch()

for (const size of sizes) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1
  })

  await page.setContent(
    `<style>
       html,body{margin:0;padding:0;background:#08040a}
       svg{display:block;width:${size}px;height:${size}px;shape-rendering:geometricPrecision}
     </style>${svg}`
  )

  const shot = await page.screenshot({ omitBackground: false })
  const name = size === 512 ? 'icon.png' : `favicon-${size}.png`
  writeFileSync(join(out, name), shot)

  console.log('  ' + name.padEnd(18) + size + '×' + size + '  ' + Math.round(shot.length / 1024) + 'KB')

  await page.close()
}

await browser.close()
