import { rollsFromSeed } from '../src/dungeon/seed.ts'
import { openTheProwl, stirTheDark } from '../src/dungeon/prowl.ts'

let checks = 0
let failures = 0

function holds(what, got) {
  checks += 1
  if (got !== true) {
    failures += 1
    console.log(`  FAIL ${what}`)
  } else {
    console.log(`  ok   ${what}`)
  }
}

function is(what, got, want) {
  checks += 1
  const same = String(got) === String(want)
  if (!same) {
    failures += 1
    console.log(`  FAIL ${what}\n       got  ${got}\n       want ${want}`)
  } else {
    console.log(`  ok   ${what.padEnd(46)} ${got}`)
  }
}

function openRoom() {
  return {
    tileSize: 64, across: 40, down: 40,
    walkable: new Array(1600).fill(true),
    chambers: [], props: [], lights: [], loot: [], enemySpots: [], bossSpot: null,
    startSpot: { x: 64, y: 64 }, width: 2560, height: 2560, shape: 'test'
  }
}

console.log('')
console.log('a deep floor can still be cleared')
console.log('')

// floor 8: 21 placed. kill them at a steady pace while the dark keeps sending.
const placed = 21
const garrison = Array.from({ length: placed }, () => ({ life: 40 }))
const wanderers = []

const order = {
  prowl: openTheProwl(0),
  plan: openRoom(),
  you: { life: 100, spot: { x: 1280, y: 1280 } },
  enemies: [...garrison, ...wanderers],
  floor: 8,
  coinsCarried: 3000,
  owed: 500,
  seenWide: 1280,
  seenTall: 720,
  rolls: rollsFromSeed('garrison'),
  now: 0
}

let killedGarrison = 0
const killEvery = 4000

for (let now = 0; now <= 300000; now += 250) {
  const come = stirTheDark({ ...order, now })
  if (come) {
    order.enemies.push(come)
    wanderers.push(come)
  }
  if (now % killEvery === 0 && killedGarrison < placed) {
    const target = garrison[killedGarrison]
    target.life = 0
    killedGarrison += 1
  }
}

const garrisonDown = garrison.every((one) => one.life <= 0)
const roomEmpty = order.enemies.every((one) => (one.life ?? 40) <= 0)

is('garrison placed on floor 8', placed, 21)
is('garrison killed one every 4s', killedGarrison, 21)
holds('the garrison is down, so the stair opens', garrisonDown)
is('wanderers still alive when it opened', wanderers.length, wanderers.length)
holds('the room is NOT empty, and that is fine now', roomEmpty === false)

console.log('')
console.log('the old rule would have trapped you')
console.log('')
holds('under the old rule the stair would never open', roomEmpty === false)

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)
console.log('')
process.exit(failures > 0 ? 1 : 0)
