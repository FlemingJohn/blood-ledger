import type { FloorPlan, Spot } from '../types/dungeon'
import type { Fighter } from '../types/fighter'
import type { Rolls } from './seed'
import { breeds, pickBreed } from './breeds'
import { isDown, makeFighter } from './fighters'

const waitsAtMost = 15000
const waitsAtLeast = 4200
const deeperShortensBy = 1100
const eachMinuteShortensBy = 2400
const carryingShortensBy = 3600
const mostAwakeAtOnce = 16
const comesNoCloserThan = 560
const keepsOffScreenBy = 140
const restsBeforeTheFirst = 11000
const eliteAfter = 45000
const eliteChanceAtMost = 0.55

export interface Prowl {
  cameHereAt: number
  nextAt: number
  sent: number
  lastCameFrom: Spot | null
}

export function openTheProwl(now: number): Prowl {
  return {
    cameHereAt: now,
    nextAt: now + restsBeforeTheFirst,
    sent: 0,
    lastCameFrom: null
  }
}

export function howLongYouHaveStayed(prowl: Prowl, now: number): number {
  return Math.max(0, now - prowl.cameHereAt)
}

export function theDebtWeighs(carried: number, owed: number): number {
  if (owed <= 0) {
    return 0
  }
  return Math.min(1.5, carried / owed)
}

function waitBetween(floor: number, stayed: number, weighs: number): number {
  const shorterForDepth = (floor - 1) * deeperShortensBy
  const shorterForStaying = (stayed / 60000) * eachMinuteShortensBy
  const shorterForCarrying = weighs * carryingShortensBy

  const waits = waitsAtMost - shorterForDepth - shorterForStaying - shorterForCarrying

  return Math.max(waitsAtLeast, waits)
}

function tileIsWalkable(plan: FloorPlan, atAcross: number, atDown: number): boolean {
  if (atAcross < 1 || atAcross >= plan.across - 1 || atDown < 1 || atDown >= plan.down - 1) {
    return false
  }
  return plan.walkable[atDown * plan.across + atAcross] === true
}

function farEnough(from: Spot, to: Spot, seenWide: number, seenTall: number): boolean {
  const alongX = Math.abs(to.x - from.x)
  const alongY = Math.abs(to.y - from.y)

  if (Math.hypot(alongX, alongY) < comesNoCloserThan) {
    return false
  }

  const outOfSight =
    alongX > seenWide / 2 + keepsOffScreenBy || alongY > seenTall / 2 + keepsOffScreenBy

  return outOfSight
}

export function findASpotInTheDark(
  plan: FloorPlan,
  from: Spot,
  seenWide: number,
  seenTall: number,
  rolls: Rolls
): Spot | null {
  for (let tried = 0; tried < 90; tried += 1) {
    const atAcross = Math.floor(rolls.next() * plan.across)
    const atDown = Math.floor(rolls.next() * plan.down)

    if (!tileIsWalkable(plan, atAcross, atDown)) {
      continue
    }

    const spot = {
      x: (atAcross + 0.5) * plan.tileSize,
      y: (atDown + 0.5) * plan.tileSize
    }

    if (farEnough(from, spot, seenWide, seenTall)) {
      return spot
    }
  }

  return null
}

export interface ProwlOrder {
  prowl: Prowl
  plan: FloorPlan
  you: Fighter
  enemies: Fighter[]
  floor: number
  coinsCarried: number
  owed: number
  seenWide: number
  seenTall: number
  rolls: Rolls
  now: number
}

export function stirTheDark(order: ProwlOrder): Fighter | null {
  const { prowl, now } = order

  if (now < prowl.nextAt) {
    return null
  }

  const awake = order.enemies.filter((enemy) => !isDown(enemy)).length

  if (awake >= mostAwakeAtOnce) {
    prowl.nextAt = now + waitsAtLeast
    return null
  }

  const stayed = howLongYouHaveStayed(prowl, now)
  const weighs = theDebtWeighs(order.coinsCarried, order.owed)

  prowl.nextAt = now + waitBetween(order.floor, stayed, weighs)

  const spot = findASpotInTheDark(
    order.plan,
    order.you.spot,
    order.seenWide,
    order.seenTall,
    order.rolls
  )

  if (!spot) {
    return null
  }

  const eliteNow = stayed > eliteAfter && order.rolls.chance(Math.min(eliteChanceAtMost, weighs))
  const breed = eliteNow
    ? breeds[order.floor >= breeds.lesserDemon.fromFloor ? 'lesserDemon' : 'boneChampion']
    : pickBreed(order.floor, order.rolls)

  prowl.sent += 1
  prowl.lastCameFrom = spot

  return makeFighter(breed.drawnAs, spot, breed)
}
