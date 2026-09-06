export type Verdict = 'fund' | 'refuse'

export type Flag =
  | 'no history at all'
  | 'never repaid anyone'
  | 'defaulted more than repaid'
  | 'funded only by one purse'
  | 'funders made the same day'
  | 'money went in a circle'
  | 'pair already spent'
  | 'stake would be too much of the purse'
  | 'standing below the floor'

export interface RaiderFacts {
  handle: string
  standing: number
  grade: string
  raids: number
  repaid: number
  lost: number
  deepestFloor: number
  distinctPatrons: number
  timesFundedByUs: number
  fundedInACircle: boolean
  youngestFunderAgeDays: number
}

export interface Decision {
  verdict: Verdict
  patronShare: number
  coinsOffered: string
  riskOfDefault: number
  flags: Flag[]
  reasons: string[]
}

export interface WrittenReason {
  saidToTheRaider: string
  saidToTheBoard: string
  camefrom: 'the model' | 'our own words'
}
