import { config } from 'dotenv'

import type { RaiderFacts } from '../src/types/underwriting'
import { judge } from '../src/chain/underwriting'
import { putItInWords } from './explain'
import { handleFor } from './masking'

config()

const mostPerRaider = Number(process.env.UNDERWRITER_MOST_PER_RAIDER ?? '0.05')

/**
 * Raiders the Underwriter is looking at.
 *
 * Once the contracts are deployed these come from TheLedger and PatronVault,
 * every one of them proved. The shapes are the same either way, so only the
 * reading changes.
 */
const lookingAt: { address: string; facts: Omit<RaiderFacts, 'handle'> }[] = [
  {
    address: '0x7a3f000000000000000000000000000000009c2e',
    facts: {
      standing: 720,
      grade: 'B+',
      raids: 12,
      repaid: 9,
      lost: 3,
      deepestFloor: 4,
      distinctPatrons: 5,
      timesFundedByUs: 0,
      fundedInACircle: false,
      youngestFunderAgeDays: 210
    }
  },
  {
    address: '0x91c2000000000000000000000000000000000004',
    facts: {
      standing: 240,
      grade: 'F',
      raids: 4,
      repaid: 1,
      lost: 3,
      deepestFloor: 2,
      distinctPatrons: 2,
      timesFundedByUs: 0,
      fundedInACircle: false,
      youngestFunderAgeDays: 40
    }
  },
  {
    address: '0xbeef00000000000000000000000000000000ca12',
    facts: {
      standing: 500,
      grade: 'C',
      raids: 6,
      repaid: 6,
      lost: 0,
      deepestFloor: 2,
      distinctPatrons: 1,
      timesFundedByUs: 0,
      fundedInACircle: true,
      youngestFunderAgeDays: 0
    }
  },
  {
    address: '0x2f88000000000000000000000000000000000012',
    facts: {
      standing: 500,
      grade: 'C',
      raids: 0,
      repaid: 0,
      lost: 0,
      deepestFloor: 0,
      distinctPatrons: 0,
      timesFundedByUs: 0,
      fundedInACircle: false,
      youngestFunderAgeDays: -1
    }
  }
]

async function main(): Promise<void> {
  console.log('\nThe Underwriter')
  console.log(`  will put at most ${mostPerRaider} ETH on any one raider`)
  console.log(
    `  ${process.env.AZURE_OPENAI_API_KEY ? 'a model will phrase the reasons' : 'no model set, it will use its own words'}`
  )
  console.log('')

  for (const one of lookingAt) {
    const facts: RaiderFacts = { handle: handleFor(one.address), ...one.facts }
    const decision = judge(facts, { mostPerRaider })
    const written = await putItInWords(facts, decision)

    const head = decision.verdict === 'fund' ? 'FUND  ' : 'REFUSE'

    console.log(`${head} ${facts.handle}`)
    console.log(`       standing ${facts.standing}, repaid ${facts.repaid} of ${facts.raids}`)
    console.log(`       risk of default ${Math.round(decision.riskOfDefault * 100)} percent`)

    if (decision.verdict === 'fund') {
      console.log(`       offering ${decision.coinsOffered} ETH, keeping ${decision.patronShare} percent`)
    }

    if (decision.flags.length > 0) {
      console.log(`       noted: ${decision.flags.join(', ')}`)
    }

    console.log(`       "${written.saidToTheRaider}"`)
    console.log(`       board: ${written.saidToTheBoard}`)
    console.log(`       words from ${written.camefrom}`)
    console.log('')
  }
}

main().catch((trouble) => {
  console.error(trouble)
  process.exit(1)
})
