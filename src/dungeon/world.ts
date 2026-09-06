import type { FloorPlan, Loot, Spot } from '../types/dungeon'
import type { Fighter, Wound } from '../types/fighter'
import { apart, blowLandsOnFrame, framesPerSecond, isDown, makeFighter } from './fighters'
import { facingFrom } from './facing'
import { planFloor } from './floorPlan'
import { breeds } from './breeds'

const framesInMove = { walk: 8, attack: 8, death: 8 }
const slimeDeathFrames = 7

const enemyWakesWithin = 420
const restBetweenBlows = 900
const youRestBetweenBlows = 420
const lootPickedUpWithin = 58

export interface WorldOrder {
  seed: string
  floor: number
}

export interface World {
  plan: FloorPlan
  you: Fighter
  enemies: Fighter[]
  loot: Loot[]
  wounds: Wound[]
  coinsCarried: number
  slain: number
  floor: number
  finished: 'still going' | 'fell' | 'walked out'
  killedBy: string | null
}

export function openWorld(order: WorldOrder): World {
  const plan = planFloor(order.seed, order.floor)

  const you = makeFighter('you', plan.startSpot)

  const enemies = plan.enemySpots.map((waiting) => {
    const breed = breeds[waiting.breed]
    return makeFighter(breed.drawnAs, waiting.spot, breed)
  })

  if (plan.bossSpot) {
    enemies.push(makeFighter('demonlord', plan.bossSpot, breeds.demonlord))
  }

  return {
    plan,
    you,
    enemies,
    loot: plan.loot.map((drop) => ({ ...drop })),
    wounds: [],
    coinsCarried: 0,
    slain: 0,
    floor: order.floor,
    finished: 'still going',
    killedBy: null
  }
}

function framesIn(fighter: Fighter): number {
  if (fighter.kind === 'slime' && fighter.move === 'death') {
    return slimeDeathFrames
  }
  return framesInMove[fighter.move]
}

function blockedAt(plan: FloorPlan, spot: Spot): boolean {
  const atAcross = Math.floor(spot.x / plan.tileSize)
  const atDown = Math.floor(spot.y / plan.tileSize)

  if (atAcross < 0 || atAcross >= plan.across || atDown < 0 || atDown >= plan.down) {
    return true
  }

  return plan.walkable[atDown * plan.across + atAcross] !== true
}

function stepToward(fighter: Fighter, plan: FloorPlan, alongX: number, alongY: number, seconds: number): void {
  const length = Math.hypot(alongX, alongY)
  if (length === 0) {
    return
  }

  const moveX = (alongX / length) * fighter.pace * seconds
  const moveY = (alongY / length) * fighter.pace * seconds

  const tryX = { x: fighter.spot.x + moveX, y: fighter.spot.y }
  if (!blockedAt(plan, tryX)) {
    fighter.spot.x = tryX.x
  }

  const tryY = { x: fighter.spot.x, y: fighter.spot.y + moveY }
  if (!blockedAt(plan, tryY)) {
    fighter.spot.y = tryY.y
  }

  fighter.facing = facingFrom(alongX, alongY)
}

function windOn(fighter: Fighter, seconds: number, now: number): void {
  fighter.frameOwed += seconds

  while (fighter.frameOwed >= 1 / framesPerSecond) {
    fighter.frameOwed -= 1 / framesPerSecond
    const last = framesIn(fighter) - 1

    if (fighter.move === 'death') {
      if (fighter.frame < last) {
        fighter.frame += 1
      } else {
        fighter.gone = true
      }
      continue
    }

    if (fighter.move === 'attack' && fighter.frame >= last) {
      fighter.move = 'walk'
      fighter.frame = 0
      fighter.blowLanded = false
      fighter.restingUntil = now + (fighter.kind === 'you' ? youRestBetweenBlows : restBetweenBlows)
      continue
    }

    fighter.frame = (fighter.frame + 1) % framesIn(fighter)
  }
}

function landBlow(world: World, striker: Fighter, now: number): void {
  if (striker.move !== 'attack' || striker.blowLanded) {
    return
  }
  if (striker.frame < blowLandsOnFrame) {
    return
  }

  striker.blowLanded = true

  if (striker.kind === 'you') {
    world.enemies.forEach((enemy) => {
      if (isDown(enemy) || apart(striker.spot, enemy.spot) > striker.reach) {
        return
      }
      enemy.life -= striker.hurts
      enemy.struckAt = now
      world.wounds.push({ spot: { ...enemy.spot }, amount: striker.hurts, bornAt: now })
      if (isDown(enemy)) {
        enemy.move = 'death'
        enemy.frame = 0
        world.slain += 1
        world.coinsCarried += enemy.breed ? enemy.breed.coinBonus : 0
      }
    })
    return
  }

  if (apart(striker.spot, world.you.spot) <= striker.reach && !isDown(world.you)) {
    world.you.life -= striker.hurts
    world.you.struckAt = now
    world.wounds.push({ spot: { ...world.you.spot }, amount: striker.hurts, bornAt: now })
    if (isDown(world.you)) {
      world.you.move = 'death'
      world.you.frame = 0
      world.finished = 'fell'
      world.killedBy = striker.breed ? striker.breed.said : striker.kind
    }
  }
}

export interface WhatYouWant {
  alongX: number
  alongY: number
  swinging: boolean
}

export function turnTheWorld(world: World, wanted: WhatYouWant, seconds: number, now: number): void {
  const you = world.you

  if (world.finished === 'still going' && !isDown(you)) {
    if (wanted.swinging && you.move !== 'attack' && now >= you.restingUntil) {
      you.move = 'attack'
      you.frame = 0
      you.blowLanded = false
    }

    if (you.move !== 'attack') {
      if (wanted.alongX !== 0 || wanted.alongY !== 0) {
        stepToward(you, world.plan, wanted.alongX, wanted.alongY, seconds)
      } else {
        you.frame = 0
        you.frameOwed = 0
      }
    }

    if (wanted.alongX !== 0 || wanted.alongY !== 0 || you.move === 'attack') {
      windOn(you, seconds, now)
    }

    landBlow(world, you, now)
  } else if (isDown(you)) {
    windOn(you, seconds, now)
  }

  world.enemies.forEach((enemy) => {
    if (isDown(enemy)) {
      if (!enemy.gone) {
        windOn(enemy, seconds, now)
      }
      return
    }
    if (isDown(you)) {
      return
    }

    const gap = apart(enemy.spot, you.spot)

    if (enemy.move === 'attack') {
      windOn(enemy, seconds, now)
      landBlow(world, enemy, now)
      return
    }

    if (gap <= enemy.reach && now >= enemy.restingUntil) {
      enemy.move = 'attack'
      enemy.frame = 0
      enemy.blowLanded = false
      enemy.facing = facingFrom(you.spot.x - enemy.spot.x, you.spot.y - enemy.spot.y)
      windOn(enemy, seconds, now)
      return
    }

    if (gap < enemyWakesWithin && gap > enemy.reach * 0.8) {
      stepToward(enemy, world.plan, you.spot.x - enemy.spot.x, you.spot.y - enemy.spot.y, seconds)
      windOn(enemy, seconds, now)
    }
  })

  world.loot.forEach((drop) => {
    if (drop.taken || isDown(you)) {
      return
    }
    if (apart(drop.spot, you.spot) <= lootPickedUpWithin) {
      drop.taken = true
      world.coinsCarried += drop.worth
    }
  })

  world.wounds = world.wounds.filter((wound) => now - wound.bornAt < 900)
}

export function everyoneStanding(world: World): boolean {
  return world.enemies.every((enemy) => isDown(enemy))
}
