import type { RaidOutcome } from './ledger'
import type { Standing } from './raider'

export interface RaiderRecord {
  deepestFloor: number
  bestHaul: number
  coinKept: number
  defaults: number
}

export interface PatronRecord {
  backed: number
  returned: number
  lost: number
  profit: number
}

export type DeedSide = 'raider' | 'patron'

export interface Deed {
  side: DeedSide
  outcome: RaidOutcome
  floorReached: number
  coinChange: number
  otherSide: string
  minutesAgo: number
}

export interface Profile {
  address: string
  standing: Standing
  asRaider: RaiderRecord
  asPatron: PatronRecord
  deeds: Deed[]
}
