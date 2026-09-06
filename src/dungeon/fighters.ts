import type { Fighter, FighterKind } from '../types/fighter'
import type { Breed } from '../types/breed'
import type { Spot } from '../types/dungeon'

interface Build {
  life: number
  hurts: number
  reach: number
  pace: number
}

const builds: Record<FighterKind, Build> = {
  you: { life: 100, hurts: 26, reach: 78, pace: 168 },
  skeleton: { life: 40, hurts: 9, reach: 62, pace: 74 },
  slime: { life: 26, hurts: 6, reach: 52, pace: 46 },
  demonlord: { life: 320, hurts: 22, reach: 104, pace: 92 }
}

export const framesPerSecond = 12
export const blowLandsOnFrame = 4

export function makeFighter(kind: FighterKind, spot: Spot, breed: Breed | null = null): Fighter {
  const build = breed
    ? { life: breed.life, hurts: breed.hurts, reach: breed.reach, pace: breed.pace }
    : builds[kind]

  return {
    kind,
    breed,
    spot: { x: spot.x, y: spot.y },
    facing: 'S',
    move: 'walk',
    frame: 0,
    frameOwed: 0,
    life: build.life,
    fullLife: build.life,
    hurts: build.hurts,
    reach: build.reach,
    pace: build.pace,
    blowLanded: false,
    restingUntil: 0,
    struckAt: 0,
    gone: false
  }
}

export function apart(here: Spot, there: Spot): number {
  return Math.hypot(there.x - here.x, there.y - here.y)
}

export function isDown(fighter: Fighter): boolean {
  return fighter.life <= 0
}
