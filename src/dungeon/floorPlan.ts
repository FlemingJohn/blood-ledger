import type { Chamber, FloorPlan, PropKind, Spot, StandingProp } from '../types/dungeon'
import { rollsFromSeed, type Rolls } from './seed'

const tileSize = 72

interface Shape {
  name: string
  across: number
  down: number
  chambers: number
  wideRange: [number, number]
  tallRange: [number, number]
}

const shapes: Shape[] = [
  { name: 'warren', across: 30, down: 22, chambers: 7, wideRange: [5, 9], tallRange: [4, 7] },
  { name: 'long hall', across: 40, down: 14, chambers: 5, wideRange: [6, 11], tallRange: [4, 8] },
  { name: 'deep shaft', across: 16, down: 34, chambers: 5, wideRange: [5, 9], tallRange: [5, 9] },
  { name: 'great chamber', across: 26, down: 24, chambers: 4, wideRange: [8, 14], tallRange: [7, 12] },
  { name: 'cloister', across: 34, down: 26, chambers: 9, wideRange: [4, 7], tallRange: [4, 6] }
]

const scatterKinds: PropKind[] = ['bones', 'rubble', 'mushrooms']
const breakableKinds: PropKind[] = ['barrel', 'crate']

function overlaps(one: Chamber, other: Chamber, gap: number): boolean {
  return (
    one.left - gap < other.left + other.wide &&
    one.left + one.wide + gap > other.left &&
    one.top - gap < other.top + other.tall &&
    one.top + one.tall + gap > other.top
  )
}

function carveChambers(rolls: Rolls, shape: Shape): Chamber[] {
  const chambers: Chamber[] = []
  let tries = 0

  while (chambers.length < shape.chambers && tries < 220) {
    tries += 1

    const wide = Math.floor(rolls.between(shape.wideRange[0], shape.wideRange[1] + 1))
    const tall = Math.floor(rolls.between(shape.tallRange[0], shape.tallRange[1] + 1))
    const left = Math.floor(rolls.between(1, shape.across - wide - 1))
    const top = Math.floor(rolls.between(1, shape.down - tall - 1))

    const wanted: Chamber = { left, top, wide, tall }

    if (chambers.some((already) => overlaps(already, wanted, 1))) {
      continue
    }

    chambers.push(wanted)
  }

  return chambers
}

function middleOf(chamber: Chamber): { across: number; down: number } {
  return {
    across: Math.floor(chamber.left + chamber.wide / 2),
    down: Math.floor(chamber.top + chamber.tall / 2)
  }
}

export function planFloor(seed: string, floor: number): FloorPlan {
  const rolls = rollsFromSeed(`${seed}:floor:${floor}`)
  const shape = rolls.pick(shapes)

  const across = shape.across
  const down = shape.down
  const walkable = new Array<boolean>(across * down).fill(false)

  function open(atAcross: number, atDown: number): void {
    if (atAcross < 0 || atAcross >= across || atDown < 0 || atDown >= down) {
      return
    }
    walkable[atDown * across + atAcross] = true
  }

  const chambers = carveChambers(rolls, shape)

  chambers.forEach((chamber) => {
    for (let atDown = chamber.top; atDown < chamber.top + chamber.tall; atDown += 1) {
      for (let atAcross = chamber.left; atAcross < chamber.left + chamber.wide; atAcross += 1) {
        open(atAcross, atDown)
      }
    }
  })

  for (let place = 1; place < chambers.length; place += 1) {
    const here = middleOf(chambers[place - 1] as Chamber)
    const there = middleOf(chambers[place] as Chamber)
    const bendFirst = rolls.chance(0.5)

    const bendAt = bendFirst ? here.down : there.down
    const stepAt = bendFirst ? there.across : here.across

    const fromAcross = Math.min(here.across, there.across)
    const toAcross = Math.max(here.across, there.across)
    for (let atAcross = fromAcross; atAcross <= toAcross; atAcross += 1) {
      open(atAcross, bendAt)
      open(atAcross, bendAt + 1)
    }

    const fromDown = Math.min(here.down, there.down)
    const toDown = Math.max(here.down, there.down)
    for (let atDown = fromDown; atDown <= toDown; atDown += 1) {
      open(stepAt, atDown)
      open(stepAt + 1, atDown)
    }
  }

  function isWalkable(atAcross: number, atDown: number): boolean {
    if (atAcross < 0 || atAcross >= across || atDown < 0 || atDown >= down) {
      return false
    }
    return walkable[atDown * across + atAcross] === true
  }

  function middleOfTile(atAcross: number, atDown: number): Spot {
    return { x: (atAcross + 0.5) * tileSize, y: (atDown + 0.5) * tileSize }
  }

  const props: StandingProp[] = []

  for (let atDown = 0; atDown < down; atDown += 1) {
    for (let atAcross = 0; atAcross < across; atAcross += 1) {
      if (isWalkable(atAcross, atDown)) {
        continue
      }
      const touchesFloor =
        isWalkable(atAcross - 1, atDown) ||
        isWalkable(atAcross + 1, atDown) ||
        isWalkable(atAcross, atDown - 1) ||
        isWalkable(atAcross, atDown + 1)

      if (!touchesFloor) {
        continue
      }

      props.push({
        kind: rolls.chance(0.72) ? 'wall1' : 'wall2',
        spot: middleOfTile(atAcross, atDown)
      })
    }
  }

  const roomTiles: { atAcross: number; atDown: number }[] = []

  chambers.forEach((chamber) => {
    for (let atDown = chamber.top + 1; atDown < chamber.top + chamber.tall - 1; atDown += 1) {
      for (let atAcross = chamber.left + 1; atAcross < chamber.left + chamber.wide - 1; atAcross += 1) {
        roomTiles.push({ atAcross, atDown })
      }
    }
  })

  const spoken = new Set<string>()

  function claim(tile: { atAcross: number; atDown: number }): boolean {
    const key = `${tile.atAcross},${tile.atDown}`
    if (spoken.has(key)) {
      return false
    }
    spoken.add(key)
    return true
  }

  const firstChamber = chambers[0]
  const lastChamber = chambers[chambers.length - 1]

  const start = firstChamber ? middleOf(firstChamber) : { across: 1, down: 1 }
  claim({ atAcross: start.across, atDown: start.down })

  const columnCount = Math.min(roomTiles.length, 3 + Math.floor(rolls.next() * 5))

  for (let made = 0; made < columnCount; made += 1) {
    const tile = rolls.pick(roomTiles)
    if (!claim(tile)) {
      continue
    }
    props.push({ kind: 'column', spot: middleOfTile(tile.atAcross, tile.atDown) })
  }

  const clutterCount = Math.min(roomTiles.length, 10 + Math.floor(rolls.next() * 10))

  for (let made = 0; made < clutterCount; made += 1) {
    const tile = rolls.pick(roomTiles)
    if (!claim(tile)) {
      continue
    }
    props.push({
      kind: rolls.chance(0.45) ? rolls.pick(breakableKinds) : rolls.pick(scatterKinds),
      spot: middleOfTile(tile.atAcross, tile.atDown)
    })
  }

  const bossFloor = 3
  const isBossFloor = floor === bossFloor || (floor > bossFloor && rolls.chance(0.4))

  const enemySpots: FloorPlan['enemySpots'] = []
  const enemyCount = Math.min(roomTiles.length, (isBossFloor ? 3 : 5) + floor * 2)

  for (let made = 0; made < enemyCount; made += 1) {
    const tile = rolls.pick(roomTiles)
    if (!claim(tile)) {
      continue
    }
    enemySpots.push({
      kind: rolls.chance(0.65) ? 'skeleton' : 'slime',
      spot: middleOfTile(tile.atAcross, tile.atDown)
    })
  }

  const loot: FloorPlan['loot'] = []
  const lootCount = Math.min(roomTiles.length, 5 + Math.floor(rolls.next() * 5))

  for (let made = 0; made < lootCount; made += 1) {
    const tile = rolls.pick(roomTiles)
    if (!claim(tile)) {
      continue
    }
    const isGem = rolls.chance(0.32)
    loot.push({
      kind: isGem ? 'gem' : 'coins',
      spot: middleOfTile(tile.atAcross, tile.atDown),
      worth: isGem
        ? Math.round(rolls.between(120, 260)) * floor
        : Math.round(rolls.between(30, 90)) * floor,
      taken: false
    })
  }

  const bossMiddle = lastChamber ? middleOf(lastChamber) : start

  return {
    tileSize,
    across,
    down,
    walkable,
    chambers,
    props,
    loot,
    enemySpots,
    bossSpot: isBossFloor ? middleOfTile(bossMiddle.across, bossMiddle.down) : null,
    startSpot: middleOfTile(start.across, start.down),
    width: across * tileSize,
    height: down * tileSize,
    shape: shape.name
  }
}
