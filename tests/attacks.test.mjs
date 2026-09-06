import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const vaultPath = resolve(here, '..', 'contracts', 'sol', 'PatronVault.sol')
const ledgerPath = resolve(here, '..', 'contracts', 'sol', 'TheLedger.sol')

let checks = 0
let failures = 0

function is(what, got, want) {
  checks += 1
  if (got !== want) {
    failures += 1
    console.log(`  FAIL ${what}: got ${got}, want ${want}`)
    return
  }
  console.log(`  ok   ${what.padEnd(46)} ${got}`)
}

function has(what, text, needle) {
  checks += 1
  if (!text.includes(needle)) {
    failures += 1
    console.log(`  FAIL ${what}`)
    return
  }
  console.log(`  ok   ${what}`)
}

const vault = await readFile(vaultPath, 'utf8')
const ledger = await readFile(ledgerPath, 'utf8')

function constantIn(text, name) {
  const found = text.match(new RegExp(name + String.raw`\s*=\s*(\d+)`))
  return found ? Number(found[1]) : null
}

console.log('\na patron cannot fund themselves\n')
has('the vault refuses raider == msg.sender', vault, 'raider == msg.sender')
has('and names the refusal', vault, 'CannotFundYourself')

console.log('\ndust stakes buy nothing\n')
has('the vault has a floor', vault, 'SMALLEST_STAKE_WORTH_ANYTHING')
has('and refuses below it', vault, 'StakeTooSmall')

console.log('\nstanding from a repeated pair falls away\n')

const full = constantIn(ledger, 'EARNED_BY_CLEARING')
const spentAfter = constantIn(ledger, 'PAIR_IS_SPENT_AFTER')

/** The same halving TheLedger.earnedFromThisPair does. */
function earnedOnPactNumber(between) {
  if (between > spentAfter) {
    return 0
  }
  let earned = full
  for (let already = 1; already < between; already += 1) {
    earned = Math.floor(earned / 2)
  }
  return earned
}

is('first pact between them', earnedOnPactNumber(1), 28)
is('second', earnedOnPactNumber(2), 14)
is('third', earnedOnPactNumber(3), 7)
is('fourth', earnedOnPactNumber(4), 3)
is('fifth', earnedOnPactNumber(5), 1)
is('sixth earns nothing at all', earnedOnPactNumber(6), 0)

console.log('\nthe wash ring, priced out\n')

const startsAt = constantIn(ledger, 'STANDING_STARTS_AT')
const topsOut = constantIn(ledger, 'STANDING_TOPS_OUT_AT')
const needed = topsOut - startsAt

let earnedByOnePair = 0
for (let between = 1; between <= spentAfter + 2; between += 1) {
  earnedByOnePair += earnedOnPactNumber(between)
}

is('one pair can ever earn at most', earnedByOnePair, 53)
is('standing needed to reach the top', needed, 500)

const pairsNeeded = Math.ceil(needed / earnedByOnePair)
is('so a ring needs this many distinct pairs', pairsNeeded, 10)

const smallestStake = 0.001
const costToFarmTheTop = pairsNeeded * spentAfter * smallestStake
console.log('')
console.log(`  a ring must run ${pairsNeeded} pairs, ${spentAfter} pacts each,`)
console.log(`  at ${smallestStake} ETH a time: ${costToFarmTheTop.toFixed(3)} ETH of real coin,`)
console.log('  every wallet visible on chain, before it can reach the top of the board.')

console.log('\nthe bond falls away as standing rises\n')

/** The same ladder TheLedger.bondShareFor walks. */
function bondShareAt(score) {
  if (score >= 900) return 0
  if (score >= 750) return 10
  if (score >= 600) return 30
  if (score >= 450) return 60
  if (score >= 300) return 80
  return 100
}

const fullBond = 0.1

for (const [score, grade, want] of [
  [240, 'F', 100],
  [380, 'D', 80],
  [500, 'C', 60],
  [640, 'B', 30],
  [780, 'B+', 10],
  [940, 'A', 0]
]) {
  const share = bondShareAt(score)
  checks += 1
  if (share !== want) {
    failures += 1
    console.log(`  FAIL standing ${score} posts ${share}%, want ${want}%`)
  } else {
    console.log(
      `  ok   standing ${String(score).padEnd(4)} grade ${grade.padEnd(2)} posts ${String(share).padStart(3)}%  = ${(fullBond * share / 100).toFixed(3)} tCTC`
    )
  }
}

console.log('\ngriefing a rival patron now costs something\n')

const freshWallet = bondShareAt(500) / 100 * fullBond
is('a fresh wallet must lock up', freshWallet, 0.06)
is('and loses it by dying', freshWallet > 0, true)

const provenRaider = bondShareAt(940) / 100 * fullBond
is('a proven raider locks up nothing', provenRaider, 0)

console.log('')
console.log(`  a rival wanting to throw raids pays ${freshWallet} tCTC each time,`)
console.log('  and the patron they cost is paid out of it.')
console.log('  a raider everyone already trusts pays nothing, because')
console.log('  their standing is the collateral.')

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)

if (failures > 0) {
  process.exit(1)
}
