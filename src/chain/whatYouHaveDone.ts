import type { Deed, PatronRecord, RaiderRecord } from '../types/profile'
import type { Pact } from '../types/pact'
import type { RaiderClass, Standing } from '../types/raider'
import type { Takings } from '../types/raid'
import { gradeFromScore } from './theLedger'

const highestStanding = 1000
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
    score: 780,
    raids: 12,
    repaid: 9,
    lost: 3,
    coins: 1240,
    chosenClass: 'warrior',
    asRaider: { deepestFloor: 5, bestHaul: 1850, coinKept: 4210, defaults: 1 },
    asPatron: { backed: 7, returned: 5, lost: 2, profit: 1340 },
    deeds: [
      { side: 'raider', outcome: 'walked out', floorReached: 3, coinChange: 1110, otherSide: '0x44AB000000000000000000000000000000000009', minutesAgo: 0, at: Date.now() - 11 * 60_000 },
      { side: 'patron', outcome: 'walked out', floorReached: 4, coinChange: 420, otherSide: '0x2F88000000000000000000000000000000000012', minutesAgo: 0, at: Date.now() - 23 * 60_000 },
      { side: 'raider', outcome: 'fell', floorReached: 2, coinChange: -300, otherSide: '0xBEEF00000000000000000000000000000000CA12', minutesAgo: 0, at: Date.now() - 46 * 60_000 },
      { side: 'patron', outcome: 'fell', floorReached: 1, coinChange: -260, otherSide: '0x91C2000000000000000000000000000000000004', minutesAgo: 0, at: Date.now() - 90 * 60_000 },
      { side: 'raider', outcome: 'walked out', floorReached: 5, coinChange: 1850, otherSide: '0x7E11000000000000000000000000000000000031', minutesAgo: 0, at: Date.now() - 132 * 60_000 }
    ]
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
