export type RaidOutcome = 'walked out' | 'fell'

export interface LedgerEntry {
  raiderAddress: string
  outcome: RaidOutcome
  floorReached: number
  coinsCarried: number
  patronChange: number
  minutesAgo: number
}
