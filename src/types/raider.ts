export type RaiderClass = 'warrior' | 'knight' | 'fighter'

export type StandingGrade = 'F' | 'D' | 'C' | 'B' | 'B+' | 'A'

export interface Standing {
  score: number
  grade: StandingGrade
  raids: number
  repaid: number
  lost: number
}

export interface Raider {
  address: string
  chosenClass: RaiderClass
  coins: number
  standing: Standing
}
