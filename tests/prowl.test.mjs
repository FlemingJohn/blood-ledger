import { rollsFromSeed } from '../src/dungeon/seed.ts'
import { openTheProwl, stirTheDark, theDebtWeighs } from '../src/dungeon/prowl.ts'

let checks = 0
let failures = 0

function is(what, got, want) {
  checks += 1
  const same = JSON.stringify(got) === JSON.stringify(want)
  if (!same) {
    failures += 1
    console.log(`  FAIL ${what}`)
    console.log(`       got  ${JSON.stringify(got)}`)
    console.log(`       want ${JSON.stringify(want)}`)
  } else {
    console.log(`  ok   ${what.padEnd(40)} ${JSON.stringify(got)}`)
  }
  return same
}

function holds(what, got) {
  return is(what, got, true)
}

function openRoom(across, down) {
  const walkable = new Array(across * down).fill(true)
  return {
    tileSize: 64,
    across,
    down,
    walkable,
    chambers: [],
    props: [],
    lights: [],
    loot: [],
    enemySpots: [],
    bossSpot: null,
    startSpot: { x: 64, y: 64 },
    width: across * 64,
    height: down * 64,
    shape: 'test'
  }
}

function standing() {
  return { life: 100, spot: { x: 640, y: 640 } }
}

function sendUntil(order, until, step) {
  const came = []
  for (let now = order.now; now <= until; now += step) {
    const one = stirTheDark({ ...order, now })
    if (one) {
      came.push(now)
      order.enemies.push(one)
    }
  }
  return came
}

function raidFor(floor, carried, owed, forMs) {
  const plan = openRoom(40, 40)
  const you = standing()
  return sendUntil(
    {
      prowl: openTheProwl(0),
      plan,
      you,
      enemies: [],
      floor,
      coinsCarried: carried,
      owed,
      seenWide: 1280,
      seenTall: 720,
      rolls: rollsFromSeed(`test:${floor}:${carried}`),
      now: 0
    },
    forMs,
    100
  )
}

console.log('')
console.log('the dark keeps sending')
console.log('')

const early = raidFor(1, 0, 500, 60_000)
holds('nothing comes in the first ten seconds', early.every((at) => at >= 11_000))
holds('something comes within the first minute', early.length > 0)

console.log('')
console.log('deeper floors send faster')
console.log('')

const shallow = raidFor(1, 0, 500, 120_000).length
const deep = raidFor(8, 0, 500, 120_000).length
is('floor 1 sends over two minutes', shallow, shallow)
is('floor 8 sends over two minutes', deep, deep)
holds('floor 8 sends more than floor 1', deep > shallow)

console.log('')
console.log('debt makes the dark hungrier')
console.log('')

const owingLittle = raidFor(4, 0, 1000, 120_000).length
const carryingPlenty = raidFor(4, 1500, 1000, 120_000).length
is('carrying nothing', owingLittle, owingLittle)
is('carrying 1.5 times the stake', carryingPlenty, carryingPlenty)
holds('carrying the coin brings more', carryingPlenty > owingLittle)

is('the debt weighs nothing when nothing is owed', theDebtWeighs(500, 0), 0)
is('the debt weighs one when carrying the stake', theDebtWeighs(500, 500), 1)
is('the debt is capped', theDebtWeighs(9999, 500), 1.5)

console.log('')
console.log('nothing arrives in your lap')
console.log('')

const plan = openRoom(40, 40)
const you = standing()
const order = {
  prowl: openTheProwl(0),
  plan,
  you,
  enemies: [],
  floor: 5,
  coinsCarried: 800,
  owed: 500,
  seenWide: 1280,
  seenTall: 720,
  rolls: rollsFromSeed('test:spots'),
  now: 0
}

const spots = []
for (let now = 0; now <= 240_000; now += 100) {
  const one = stirTheDark({ ...order, now })
  if (one) {
    order.enemies.push(one)
    spots.push(one.spot)
  }
}

holds('some arrived to measure', spots.length > 0)
holds(
  'every arrival is beyond arm reach',
  spots.every((spot) => Math.hypot(spot.x - you.spot.x, spot.y - you.spot.y) >= 560)
)
holds(
  'every arrival is off screen',
  spots.every(
    (spot) =>
      Math.abs(spot.x - you.spot.x) > 1280 / 2 + 140 ||
      Math.abs(spot.y - you.spot.y) > 720 / 2 + 140
  )
)

console.log('')
console.log('the dark does not swarm without limit')
console.log('')

const crowd = {
  prowl: openTheProwl(0),
  plan: openRoom(40, 40),
  you: standing(),
  enemies: [],
  floor: 9,
  coinsCarried: 4000,
  owed: 500,
  seenWide: 1280,
  seenTall: 720,
  rolls: rollsFromSeed('test:crowd'),
  now: 0
}

for (let now = 0; now <= 600_000; now += 100) {
  const one = stirTheDark({ ...crowd, now })
  if (one) {
    crowd.enemies.push(one)
  }
}

is('awake at once never passes the cap', crowd.enemies.length, 16)

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)
console.log('')

process.exit(failures > 0 ? 1 : 0)
