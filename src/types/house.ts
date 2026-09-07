export interface HousePurseSide {
  realm: string
  shortName: string
  coinSymbol: string
  houseHolds: string
  drip: string
  canGive: boolean
  why: string | null
}

export interface HouseOffer {
  patronAddress: string
  coinsStaked: string
  coinSymbol: string
  patronShare: number
  words: string
  canBack: boolean
  why: string | null
}

export interface WhatYouHold {
  sepolia: string
  creditcoin: string
}

export interface HouseReading {
  purse: {
    sepolia: HousePurseSide
    creditcoin: HousePurseSide
    pursesLeft: number
    mostPerAddress: number
  }
  patron: HouseOffer
  youHold: WhatYouHold | null
}

export interface HandedOver {
  realm: string
  shortName: string
  coinSymbol: string
  coins: string
  txHash: string
  lookUpAt: string
}

export interface Backed {
  raider: string
  patronAddress: string
  coinsStaked: string
  patronShare: number
  txHash: string
  lookUpAt: string
}

export type HouseAnswer<Held> = { held: Held } | { trouble: string }
