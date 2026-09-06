import type { Facing, Move, Spot } from './dungeon'
import type { Breed } from './breed'

export type FighterKind = 'you' | 'skeleton' | 'slime' | 'demonlord'

export interface Fighter {
  kind: FighterKind
  breed: Breed | null
  spot: Spot
  facing: Facing
  move: Move
  frame: number
  frameOwed: number
  life: number
  fullLife: number
  hurts: number
  reach: number
  pace: number
  blowLanded: boolean
  restingUntil: number
  struckAt: number
  gone: boolean
}

export interface Wound {
  spot: Spot
  amount: number
  bornAt: number
}
