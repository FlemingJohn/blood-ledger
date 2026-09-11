import type { Fighter } from '../types/fighter'
import type { World } from '../dungeon/world'
import { isDown } from '../dungeon/fighters'

const closeEnoughToTeach = 420
const tooCloseToStop = 130
const restBetween = 15_000

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

export function watchForMoments(): MomentsBelow {
  const shown = new Set<MomentName>()
  let lastShownAt = 0

  function alive(world: World): Fighter[] {
    return world.enemies.filter((enemy) => !isDown(enemy))
  }

  function apart(one: Fighter, other: Fighter): number {
    return Math.hypot(one.spot.x - other.spot.x, one.spot.y - other.spot.y)
  }

  function nearestComing(world: World): Fighter | null {
    let nearest: Fighter | null = null
    let closest = Infinity

    alive(world).forEach((enemy) => {
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

  return {
    nearestComing,

    markShown(which: MomentName, now: number): void {
      shown.add(which)
      lastShownAt = now
    },

    lookAround(here: WhatIsHappening): MomentName | null {
      const { world, now } = here

      if (now - lastShownAt < restBetween) {
        return null
      }
      if (!safeToStop(world)) {
        return null
      }

      if (!shown.has('the stair') && here.stairIsOpen) {
        return 'the stair'
      }

      if (!shown.has('first coin') && world.coinsCarried > 0) {
        return 'first coin'
      }

      if (!shown.has('hurt') && world.you.life > 0 && world.you.life < world.you.fullLife / 2) {
        return 'hurt'
      }

      if (!shown.has('the dark')) {
        const nearest = nearestComing(world)
        if (nearest && apart(nearest, world.you) < closeEnoughToTeach) {
          return 'the dark'
        }
      }

      return null
    }
  }
}
