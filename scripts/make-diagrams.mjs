import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const out = 'D:\\Hack\\buidl-images'
mkdirSync(out, { recursive: true })

/* A form will refuse a picture five thousand pixels tall, so both of these are
   laid left to right and the long edge is pinned to this. */
const longEdge = 1600

const theme =
  "%%{init: {'theme':'base','themeVariables':{" +
  "'primaryColor':'#1b0a10','primaryTextColor':'#e0d5c4','primaryBorderColor':'#8b0b2e'," +
  "'lineColor':'#8b0b2e','fontFamily':'Georgia, serif','fontSize':'15px'}}}%%"

const diagrams = [
  {
    name: '08-flow-two-chains.png',
    body: `${theme}
flowchart LR
    E["<b>ETHEREUM</b><br/>the money goes in"] --> A["<b>ATTESTCOIN</b><br/>the payment<br/>becomes provable"]
    A --> C["<b>CREDITCOIN</b><br/>the pact and the name<br/>outlive the raid"]
    C --> G["<b>THE GAME</b><br/>you live with<br/>the consequences"]

    style E fill:#1b0a10,stroke:#c9a227,color:#c9a227
    style A fill:#1b0a10,stroke:#ff3d78,color:#ff3d78
    style C fill:#1b0a10,stroke:#ff3d78,color:#ff3d78
    style G fill:#1b0a10,stroke:#e0d5c4,color:#e0d5c4`
  },
  {
    name: '09-flow-sealing.png',
    body: `${theme}
flowchart LR
    F["<b>fundRaid()</b><br/>on Ethereum"] --> EV["vault emits<br/><b>RaidFunded</b>"]
    EV --> W["witnesses attest<br/>the Sepolia block<br/><i>about nine minutes</i>"]
    W --> PR["Merkle proof and<br/>continuity roots"]
    PR --> EX["<b>execute()</b><br/>on Creditcoin"]
    EX --> PC{"block-prover<br/>precompile<br/>0x...0FD2"}
    PC -->|"query id<br/>already spent"| R1["refused"]
    PC -->|"not the<br/>named vault"| R2["refused"]
    PC -->|"proof holds"| S["<b>pact sealed</b><br/>amount read<br/>out of the proof"]

    style F fill:#1b0a10,stroke:#c9a227,color:#c9a227
    style PC fill:#1b0a10,stroke:#ff3d78,color:#ff3d78
    style S fill:#1b0a10,stroke:#c9a227,color:#c9a227
    style R1 fill:#1b0a10,stroke:#8b0b2e,color:#7d6a70
    style R2 fill:#1b0a10,stroke:#8b0b2e,color:#7d6a70`
  }
]

const browser = await chromium.launch()

for (const one of diagrams) {
  const page = await browser.newPage({
    viewport: { width: 2000, height: 1400 },
    deviceScaleFactor: 2
  })

  await page.setContent(`
    <style>
      html, body { margin: 0; background: #08040a; }
      #wrap { display: inline-block; padding: 34px 40px; background: #08040a; }
      .mermaid { background: transparent; margin: 0; }

      /* mermaid gives edge labels a pale plate of their own, which fights the
         palette everywhere else */
      .mermaid .edgeLabel,
      .mermaid .edgeLabel p,
      .mermaid .edgeLabel rect,
      .mermaid .edgeLabel foreignObject div,
      .mermaid .edgeLabel .labelBkg { background: #08040a !important; }
      .mermaid .edgeLabel, .mermaid .edgeLabel p { color: #7d6a70 !important; }

      /* node labels keep the node's own fill behind them */
      .mermaid .nodeLabel, .mermaid .nodeLabel p,
      .mermaid .node foreignObject div { background: transparent !important; }
    </style>
    <div id="wrap"><pre class="mermaid">${one.body
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</pre></div>
  `)

  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js' })

  await page.evaluate(async () => {
    window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' })
    await window.mermaid.run()
  })

  await page.waitForSelector('#wrap svg', { timeout: 30_000 })

  /* mermaid leaves the svg at whatever height its box happened to be, so pin it
     to the viewBox it drew into, scaled so the finished picture lands on the cap */
  await page.evaluate((cap) => {
    const svg = document.querySelector('#wrap svg')
    const [, , wide, tall] = svg.getAttribute('viewBox').split(/\s+/).map(Number)

    /* the page renders at 2x, so half the cap in css pixels */
    const grow = cap / 2 / Math.max(wide, tall)

    svg.style.width = wide * grow + 'px'
    svg.style.height = tall * grow + 'px'
    svg.style.maxWidth = 'none'
    svg.style.display = 'block'
  }, longEdge)

  await page.waitForTimeout(400)

  const shot = await page.locator('#wrap').screenshot()
  writeFileSync(join(out, one.name), shot)

  const box = await page.locator('#wrap').boundingBox()
  console.log(
    '  ' + one.name.padEnd(26) +
    Math.round(box.width * 2) + 'x' + Math.round(box.height * 2) + '  ' +
    Math.round(shot.length / 1024) + 'KB'
  )

  await page.close()
}

await browser.close()
console.log('')
console.log('  ' + out)
