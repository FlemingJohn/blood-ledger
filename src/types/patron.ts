export type StakingStep =
  | 'naming the raider'
  | 'waiting on your purse'
  | 'coin is leaving ethereum'
  | 'witnesses are agreeing'
  | 'the pact is sealed'
  | 'it did not go through'

export interface StakingProgress {
  step: StakingStep
  txHash: string | null
  trouble: string | null
}

export interface StakeYouMade {
  pactId: string
  raider: string
  coinsStaked: string
  patronShare: number
  txHash: string
  stakedAt: number
}

export interface WhatYouOffer {
  raider: string
  coins: string
  patronShare: number
}
