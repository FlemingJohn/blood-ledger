import type { Deed, PatronRecord, RaiderRecord } from '../types/profile'
import type { Pact } from '../types/pact'
import type { RaiderClass, Standing } from '../types/raider'
import type { Takings } from '../types/raid'
import { gradeFromScore } from './theLedger'

const highestStanding = 1000
const startsAt = 500
const startingPurse = 0
const deedsKept = 12

interface Written extends Deed {
  at: number
}

interface WhatYouHaveDone {
  score: number
  raids: number
  repaid: number
  lost: number
  coins: number
  chosenClass: RaiderClass
  asRaider: RaiderRecord
  asPatron: PatronRecord
  deeds: Written[]
}

function fresh(): WhatYouHaveDone {
  return {
    score: startsAt,
    raids: 0,
    repaid: 0,
    lost: 0,
    coins: startingPurse,
    chosenClass: 'warrior',
    asRaider: { deepestFloor: 0, bestHaul: 0, coinKept: 0, defaults: 0 },
    asPatron: { backed: 0, returned: 0, lost: 0, profit: 0 },
    deeds: []
  }
}

const held = new Map<string, WhatYouHaveDone>()

function forWhoever(address: string): WhatYouHaveDone {
  const key = address.toLowerCase()
  const found = held.get(key)

  if (found) {
    return found
  }

  const made = fresh()
  held.set(key, made)
  return made
}

function writeDown(done: WhatYouHaveDone, deed: Omit<Written, 'minutesAgo' | 'at'>): void {
  done.deeds.unshift({ ...deed, minutesAgo: 0, at: Date.now() })
  done.deeds.length = Math.min(done.deeds.length, deedsKept)
}

export function takeTheChainsWord(address: string, told: Standing): void {
  const done = forWhoever(address)

  done.score = told.score
  done.raids = told.raids
  done.repaid = told.repaid
  done.lost = told.lost
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

export function raiderRecordOf(address: string): RaiderRecord {
  return { ...forWhoever(address).asRaider }
}

export function patronRecordOf(address: string): PatronRecord {
  return { ...forWhoever(address).asPatron }
}

export function deedsOf(address: string): Deed[] {
  const now = Date.now()

  return forWhoever(address).deeds.map((deed) => ({
    side: deed.side,
    outcome: deed.outcome,
    floorReached: deed.floorReached,
    coinChange: deed.coinChange,
    otherSide: deed.otherSide,
    minutesAgo: Math.max(0, Math.round((now - deed.at) / 60_000))
  }))
}

export function writeUpTheRaid(address: string, takings: Takings, pact: Pact): void {
  const done = forWhoever(address)
  const lived = takings.ending === 'walked out'

  done.score = Math.max(0, Math.min(highestStanding, takings.standingAfter))
  done.raids += 1
  done.coins += takings.youKeep

  if (takings.debtCleared) {
    done.repaid += 1
  }

  if (!lived) {
    done.lost += 1
    done.asRaider.defaults += 1
  }

  done.asRaider.deepestFloor = Math.max(done.asRaider.deepestFloor, takings.floorReached)
  done.asRaider.bestHaul = Math.max(done.asRaider.bestHaul, takings.coinsCarried)
  done.asRaider.coinKept += takings.youKeep

  writeDown(done, {
    side: 'raider',
    outcome: takings.ending,
    floorReached: takings.floorReached,
    coinChange: lived ? takings.youKeep : -pact.coinsStaked,
    otherSide: pact.patronAddress
  })
}

export function writeUpTheStake(address: string, raider: string, coinsStaked: number): void {
  const done = forWhoever(address)

  done.asPatron.backed += 1

  writeDown(done, {
    side: 'patron',
    outcome: 'walked out',
    floorReached: 0,
    coinChange: -coinsStaked,
    otherSide: raider
  })
}
