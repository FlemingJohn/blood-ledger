const artRoot = '/art'

function countUp(count: number): number[] {
  return Array.from({ length: count }, (_, step) => step)
}

export const stoneFloor = `${artRoot}/ground/stone.png`
export const darkenedEdges = `${artRoot}/ui/vignette.png`
export const gauntletPointer = `${artRoot}/ui/pointer-red.png`
export const sleepingWatcher = `${artRoot}/watcher/idle.png`
export const scatteredBones = `${artRoot}/scatter/bones.png`
export const scatteredRocks = `${artRoot}/scatter/rocks.png`

export const burningTorch = countUp(8).map((step) => `${artRoot}/torch/lit-${step}.png`)
export const risingFlame = countUp(8).map((step) => `${artRoot}/flame/flame-${step}.png`)
export const bladeSweep = countUp(8).map((step) => `${artRoot}/sweep/sweep-${step}.png`)

export const everyPieceOfArt = [
  stoneFloor,
  darkenedEdges,
  gauntletPointer,
  sleepingWatcher,
  scatteredBones,
  scatteredRocks,
  ...burningTorch,
  ...risingFlame,
  ...bladeSweep
]
