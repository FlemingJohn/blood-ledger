import type { Fighter } from '../types/fighter'
import type { World } from '../dungeon/world'
import { isDown } from '../dungeon/fighters'

const closeEnoughToTeach = 760
const tooCloseToStop = 95
const restBetween = 15_000
const waitedLongEnough = 6_000

export type MomentName = 'the dark' | 'first coin' | 'hurt' | 'the stair'

export interface WhatIsHappening {
  world: World
  stairIsOpen: boolean
  now: number
}

export interface MomentsBelow {
  lookAround(here: WhatIsHappening): MomentName | null
  nearestComing(world: World): Fighter | null
  markShown(which: MomentName, now: number): void
}

function apart(one: Fighter, other: Fighter): number {
  return Math.hypot(one.spot.x - other.spot.x, one.spot.y - other.spot.y)
}

export function watchForMoments(): MomentsBelow {
  const shown = new Set<MomentName>()
  let lastShownAt = 0
  let waitingSince = 0

  function nearestComing(world: World): Fighter | null {
    let nearest: Fighter | null = null
    let closest = Infinity

    world.enemies.forEach((enemy) => {
      if (isDown(enemy)) {
        return
      }

      const gap = apart(enemy, world.you)

      if (gap < closest) {
        closest = gap
        nearest = enemy
      }
    })

    return nearest
  }

  function safeToStop(world: World): boolean {
    const nearest = nearestComing(world)
    return nearest === null || apart(nearest, world.you) > tooCloseToStop
  }

  function whatIsWanted(here: WhatIsHappening): MomentName | null {
    const { world } = here

    if (!shown.has('the dark')) {
      const nearest = nearestComing(world)

      if (nearest && apart(nearest, world.you) < closeEnoughToTeach) {
        return 'the dark'
      }
    }

    if (!shown.has('first coin') && world.coinsCarried > 0) {
      return 'first coin'
    }

    if (!shown.has('hurt') && world.you.life > 0 && world.you.life < world.you.fullLife / 2) {
      return 'hurt'
    }

    if (!shown.has('the stair') && here.stairIsOpen) {
      return 'the stair'
    }

    return null
  }

  return {
    nearestComing,

    markShown(which: MomentName, now: number): void {
      shown.add(which)
      lastShownAt = now
      waitingSince = 0
    },

    lookAround(here: WhatIsHappening): MomentName | null {
      if (here.now - lastShownAt < restBetween) {
        return null
      }

      const wanted = whatIsWanted(here)

      if (!wanted) {
        waitingSince = 0
        return null
      }

      if (waitingSince === 0) {
        waitingSince = here.now
      }

      if (!safeToStop(here.world) && here.now - waitingSince < waitedLongEnough) {
        return null
      }

      return wanted
    }
  }
}
