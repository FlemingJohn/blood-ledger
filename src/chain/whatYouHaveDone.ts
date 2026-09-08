import type { RaiderClass, Standing } from '../types/raider'
import type { Takings } from '../types/raid'
import { gradeFromScore } from './theLedger'

const startsWith = {
  score: 780,
  raids: 12,
  repaid: 9,
  lost: 3,
  coins: 1240,
  chosenClass: 'warrior' as RaiderClass
}

const highestStanding = 1000

interface WhatYouHaveDone {
  score: number
  raids: number
  repaid: number
  lost: number
  coins: number
  chosenClass: RaiderClass
}

const held = new Map<string, WhatYouHaveDone>()

function forWhoever(address: string): WhatYouHaveDone {
  const key = address.toLowerCase()
  const found = held.get(key)

  if (found) {
    return found
  }

  const fresh = { ...startsWith }
  held.set(key, fresh)
  return fresh
}

export function standingOf(address: string): Standing {
  const done = forWhoever(address)

  return {
    score: done.score,
    grade: gradeFromScore(done.score),
    raids: done.raids,
    repaid: done.repaid,
    lost: done.lost
  }
}

export function coinsOf(address: string): number {
  return forWhoever(address).coins
}

export function classOf(address: string): RaiderClass {
  return forWhoever(address).chosenClass
}

export function rememberTheClass(address: string, chosen: RaiderClass): void {
  forWhoever(address).chosenClass = chosen
}

export function writeUpTheRaid(address: string, takings: Takings): void {
  const done = forWhoever(address)

  done.score = Math.max(0, Math.min(highestStanding, takings.standingAfter))
  done.raids += 1
  done.coins += takings.youKeep

  if (takings.debtCleared) {
    done.repaid += 1
  }

  if (takings.ending === 'fell') {
    done.lost += 1
  }
}
