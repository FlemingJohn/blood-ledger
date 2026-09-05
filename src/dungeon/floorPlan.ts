import type { FloorPlan, PropKind, Spot, StandingProp } from '../types/dungeon'
import { rollsFromSeed } from './seed'

const roomWidth = 1600
const roomHeight = 1200
const wallStep = 96
const keepClearOfWalls = 150
const keepApart = 130

const scatterKinds: PropKind[] = ['bones', 'rubble', 'mushrooms']
const breakableKinds: PropKind[] = ['barrel', 'crate']

function farEnough(spot: Spot, taken: Spot[], gap: number): boolean {
  return taken.every((other) => Math.hypot(other.x - spot.x, other.y - spot.y) >= gap)
}

export function planFloor(seed: string, floor: number): FloorPlan {
  const rolls = rollsFromSeed(`${seed}:${floor}`)

  const props: StandingProp[] = []
  const taken: Spot[] = []

  for (let x = wallStep / 2; x < roomWidth; x += wallStep) {
    props.push({
      kind: rolls.chance(0.7) ? 'wall1' : 'wall2',
      spot: { x, y: 0 },
      blocks: true
    })
    props.push({
      kind: rolls.chance(0.7) ? 'wall1' : 'wall2',
      spot: { x, y: roomHeight },
      blocks: true
    })
  }

  for (let y = wallStep; y < roomHeight; y += wallStep) {
    props.push({ kind: 'wall2', spot: { x: 0, y }, blocks: true })
    props.push({ kind: 'wall2', spot: { x: roomWidth, y }, blocks: true })
  }

  const columnCount = 4 + Math.floor(rolls.next() * 3)

  for (let made = 0; made < columnCount; made += 1) {
    const spot = {
      x: rolls.between(keepClearOfWalls * 2, roomWidth - keepClearOfWalls * 2),
      y: rolls.between(keepClearOfWalls * 2, roomHeight - keepClearOfWalls * 2)
    }
    if (farEnough(spot, taken, 260)) {
      props.push({ kind: 'column', spot, blocks: true })
      taken.push(spot)
    }
  }

  const clutterCount = 12 + Math.floor(rolls.next() * 8)

  for (let made = 0; made < clutterCount; made += 1) {
    const spot = {
      x: rolls.between(keepClearOfWalls, roomWidth - keepClearOfWalls),
      y: rolls.between(keepClearOfWalls, roomHeight - keepClearOfWalls)
    }
    if (!farEnough(spot, taken, keepApart)) {
      continue
    }
    const breakable = rolls.chance(0.4)
    props.push({
      kind: breakable ? rolls.pick(breakableKinds) : rolls.pick(scatterKinds),
      spot,
      blocks: breakable
    })
    taken.push(spot)
  }

  const bossFloor = 3
  const isBossFloor = floor >= bossFloor

  const enemySpots: FloorPlan['enemySpots'] = []
  const enemyCount = isBossFloor ? 3 : 4 + floor * 2

  for (let made = 0; made < enemyCount; made += 1) {
    const spot = {
      x: rolls.between(keepClearOfWalls * 2, roomWidth - keepClearOfWalls),
      y: rolls.between(keepClearOfWalls, roomHeight - keepClearOfWalls)
    }
    if (!farEnough(spot, taken, 90)) {
      continue
    }
    enemySpots.push({
      kind: rolls.chance(0.65) ? 'skeleton' : 'slime',
      spot
    })
    taken.push(spot)
  }

  const loot: FloorPlan['loot'] = []
  const lootCount = 4 + Math.floor(rolls.next() * 4)

  for (let made = 0; made < lootCount; made += 1) {
    const spot = {
      x: rolls.between(keepClearOfWalls, roomWidth - keepClearOfWalls),
      y: rolls.between(keepClearOfWalls, roomHeight - keepClearOfWalls)
    }
    if (!farEnough(spot, taken, 100)) {
      continue
    }
    const isGem = rolls.chance(0.3)
    loot.push({
      kind: isGem ? 'gem' : 'coins',
      spot,
      worth: isGem
        ? Math.round(rolls.between(120, 260)) * floor
        : Math.round(rolls.between(30, 90)) * floor,
      taken: false
    })
    taken.push(spot)
  }

  return {
    width: roomWidth,
    height: roomHeight,
    props,
    loot,
    enemySpots,
    bossSpot: isBossFloor ? { x: roomWidth - 300, y: roomHeight / 2 } : null,
    startSpot: { x: 180, y: roomHeight / 2 }
  }
}
