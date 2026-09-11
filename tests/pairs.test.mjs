import { strict as assert } from 'node:assert'

const earnedByClearing = 28
const pairIsSpentAfter = 5

function whatTheNextOneEarns(timesAlready) {
  const next = timesAlready + 1
  if (next > pairIsSpentAfter) return 0
  let earned = earnedByClearing
  for (let already = 1; already < next; already += 1) earned = Math.floor(earned / 2)
  return earned
}

console.log('\nwhat a pair earns, halving as they repeat\n')
const wanted = [[0, 28], [1, 14], [2, 7], [3, 3], [4, 1], [5, 0], [6, 0], [9, 0]]
let passed = 0

for (const [already, should] of wanted) {
  const got = whatTheNextOneEarns(already)
  assert.equal(got, should, `backed ${already} times should earn ${should}, got ${got}`)
  console.log(`  ok   backed ${already} times, the next earns${String(got).padStart(4)}`)
  passed += 1
}

assert.ok(whatTheNextOneEarns(0) > whatTheNextOneEarns(1), 'a first pact must be worth more than a second')
console.log('  ok   a first pact is always worth more than a second')
passed += 1

console.log(`\n${passed} of ${passed} checks passed\n`)
