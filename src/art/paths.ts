import type { RaiderClass } from '../types/raider'

const artRoot = '/art'

function countUp(count: number): number[] {
  return Array.from({ length: count }, (_, step) => step)
}

export const stoneFloor = `${artRoot}/ground/stone.png`
export const darkenedEdges = `${artRoot}/ui/vignette.png`
export const gauntlets = {
  resting: `${artRoot}/ui/pointer-white.png`,
  enemy: `${artRoot}/ui/pointer-red.png`,
  loot: `${artRoot}/ui/pointer-yellow.png`,
  wayOut: `${artRoot}/ui/pointer-green.png`,
  patron: `${artRoot}/ui/pointer-blue.png`
}
export const sleepingWatcher = `${artRoot}/watcher/idle.png`
export const scatteredBones = `${artRoot}/scatter/bones.png`
export const scatteredRocks = `${artRoot}/scatter/rocks.png`

export const standingRing = `${artRoot}/ui/ring-red.png`
export const offerMarker = `${artRoot}/ui/marker-red.png`
export const coinMark = `${artRoot}/prop/coins.png`

export const burningTorch = countUp(8).map((step) => `${artRoot}/torch/lit-${step}.png`)
export const risingFlame = countUp(8).map((step) => `${artRoot}/flame/flame-${step}.png`)
export const bladeSweep = countUp(8).map((step) => `${artRoot}/sweep/sweep-${step}.png`)
export const goldSparkle = countUp(8).map((step) => `${artRoot}/sparkle/glint-${step}.png`)

export const raiderPoses: Record<RaiderClass, string[]> = {
  warrior: countUp(8).map((step) => `${artRoot}/raider/warrior-${step}.png`),
  knight: countUp(8).map((step) => `${artRoot}/raider/knight-${step}.png`),
  fighter: countUp(8).map((step) => `${artRoot}/raider/fighter-${step}.png`)
}

export const everyPieceOfArt = [
  stoneFloor,
  darkenedEdges,
  ...Object.values(gauntlets),
  sleepingWatcher,
  scatteredBones,
  scatteredRocks,
  ...bladeSweep
]

export const everyPieceOfHallArt = [
  standingRing,
  offerMarker,
  coinMark,
  ...raiderPoses.warrior,
  ...goldSparkle
]

export const restOfTheRaiders = [...raiderPoses.knight, ...raiderPoses.fighter]
