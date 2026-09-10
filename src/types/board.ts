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
