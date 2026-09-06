import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const solPath = resolve(here, '..', 'contracts', 'sol', 'TheLedger.sol')

let checks = 0
let failures = 0

function said(value) {
  return typeof value === 'bigint' ? `${value}` : JSON.stringify(value)
}

function is(what, got, want) {
  checks += 1
  const same = said(got) === said(want)
  if (!same) {
    failures += 1
    console.log(`  FAIL ${what}`)
    console.log(`       got  ${said(got)}`)
    console.log(`       want ${said(want)}`)
  } else {
    console.log(`  ok   ${what.padEnd(34)} ${said(got)}`)
  }
  return same
}

function reckonLikeSolidity(pact, ending, coinsCarried, standingBefore, rules) {
  const lived = ending === 'WalkedOut'
  const carried = lived ? coinsCarried : 0n
  const patronTakes = lived ? (carried * BigInt(pact.patronShare)) / 100n : pact.coinsStaked
  const raiderKeeps = lived ? carried - patronTakes : 0n
  const debtCleared = lived && carried >= pact.coinsStaked

  let standingAfter
  if (!lived) {
    standingAfter =
      standingBefore > rules.lostByDefault ? standingBefore - rules.lostByDefault : 0
  } else if (debtCleared) {
    const raised = standingBefore + rules.earnedByClearing
    standingAfter = raised > rules.topsOutAt ? rules.topsOutAt : raised
  } else {
    standingAfter =
      standingBefore > rules.lostByLeavingShort ? standingBefore - rules.lostByLeavingShort : 0
  }

  return { patronTakes, raiderKeeps, debtCleared, standingAfter }
}

const sol = await readFile(solPath, 'utf8')

function constantIn(name) {
  const found = sol.match(new RegExp(name + String.raw`\s*=\s*(\d+)`))
  if (!found) {
    throw new Error(`${name} is not in TheLedger.sol`)
  }
  return Number(found[1])
}

const rules = {
  startsAt: constantIn('STANDING_STARTS_AT'),
  topsOutAt: constantIn('STANDING_TOPS_OUT_AT'),
  earnedByClearing: constantIn('EARNED_BY_CLEARING'),
  lostByLeavingShort: constantIn('LOST_BY_LEAVING_SHORT'),
  lostByDefault: constantIn('LOST_BY_DEFAULT'),
  shareOutOf: constantIn('SHARE_IS_OUT_OF')
}

console.log('rules read straight out of TheLedger.sol')
console.log(` ${JSON.stringify(rules)}\n`)

const pact = { coinsStaked: 500n, patronShare: 40 }

console.log('walked out rich')
{
  const got = reckonLikeSolidity(pact, 'WalkedOut', 1850n, 720, rules)
  is('patron takes 40 percent', got.patronTakes, 740n)
  is('raider keeps the rest', got.raiderKeeps, 1110n)
  is('nothing leaks', got.patronTakes + got.raiderKeeps, 1850n)
  is('debt cleared', got.debtCleared, true)
  is('standing rises', got.standingAfter, 748)
}

console.log('walked out short')
{
  const got = reckonLikeSolidity(pact, 'WalkedOut', 340n, 720, rules)
  is('patron still takes their share', got.patronTakes, 136n)
  is('raider keeps the rest', got.raiderKeeps, 204n)
  is('debt not cleared', got.debtCleared, false)
  is('standing slips', got.standingAfter, 708)
}

console.log('walked out with exactly the stake')
{
  const got = reckonLikeSolidity(pact, 'WalkedOut', 500n, 720, rules)
  is('debt cleared on the nose', got.debtCleared, true)
  is('standing rises', got.standingAfter, 748)
}

console.log('fell')
{
  const got = reckonLikeSolidity(pact, 'Fell', 1850n, 720, rules)
  is('patron loses the whole stake', got.patronTakes, 500n)
  is('raider keeps nothing', got.raiderKeeps, 0n)
  is('debt defaulted', got.debtCleared, false)
  is('standing falls hard', got.standingAfter, 634)
}

console.log('standing cannot run past its ends')
{
  const high = reckonLikeSolidity(pact, 'WalkedOut', 900n, 990, rules)
  is('caps at the top', high.standingAfter, rules.topsOutAt)

  const low = reckonLikeSolidity(pact, 'Fell', 0n, 40, rules)
  is('floors at zero', low.standingAfter, 0)
}

console.log('a patron may not take everything')
{
  const greedy = { coinsStaked: 500n, patronShare: 100 }
  const got = reckonLikeSolidity(greedy, 'WalkedOut', 1000n, 720, rules)
  is('the split still balances', got.patronTakes + got.raiderKeeps, 1000n)
}

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)

if (failures > 0) {
  process.exit(1)
}
