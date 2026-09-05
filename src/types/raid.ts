import type { Pact } from './pact'

export type RaidEnding = 'walked out' | 'fell'

export interface Takings {
  ending: RaidEnding
  floorReached: number
  coinsCarried: number
  patronShare: number
  patronTakes: number
  youKeep: number
  debtCleared: boolean
  standingBefore: number
  standingAfter: number
  killedBy: string | null
}

export interface RaidOrder {
  pact: Pact
  standing: number
  seed: string
}
