import type { Standing } from './raider'

export type HowItStands = 'waiting on the witnesses' | 'open' | 'over' | 'taken back'

export interface CoinPutUp {
  pactId: number
  patronAddress: string
  raiderAddress: string
  coinsStaked: string
  patronShare: number
  stakedAt: number
  stands: HowItStands
}

export interface TheBoard {
  inYourName: CoinPutUp[]
  below: CoinPutUp[]
}

export interface BeenDown {
  address: string
  standing: Standing
  known: boolean
  holdsAPact: boolean
  note: string | null
}
