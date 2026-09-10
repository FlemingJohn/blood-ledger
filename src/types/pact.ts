import type { StandingGrade } from './raider'

export type OfferState = 'open' | 'rich' | 'shut' | 'claimed' | 'held'

export interface Offer {
  id: string
  patronAddress: string
  patronName: string | null
  coinsStaked: number
  patronShare: number
  words: string
  needsGrade: StandingGrade
  claimed: boolean
  reckoned: boolean
}

export interface Pact {
  offerId: string
  pactId: number | null
  patronAddress: string
  coinsStaked: number
  patronShare: number
  sealedAt: number
}

export type SealingStep =
  | 'coin has left ethereum'
  | 'witnesses are agreeing'
  | 'carrying the proof'
  | 'forging your blade'

export type StepState = 'waiting' | 'working' | 'done' | 'failed'

export interface SealingProgress {
  steps: { step: SealingStep; state: StepState }[]
  finished: boolean
  trouble: string | null
}

export type SealingWatcher = (progress: SealingProgress) => void
