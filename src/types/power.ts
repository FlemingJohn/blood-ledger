import type { RaiderClass } from './raider'
import type { Spot } from './dungeon'

export type PowerName =
  | 'cleave'
  | 'bulwark'
  | 'groundSlam'
  | 'shieldWall'
  | 'dash'
  | 'flurry'

export interface Power {
  name: PowerName
  said: string
  forClass: RaiderClass
  restsFor: number
  lastsFor: number
  costsCoin: number
}

export interface PowerInFlight {
  power: Power
  bornAt: number
  from: Spot
  facingX: number
  facingY: number
}
