import type { GemGrade } from './dungeon'
import type { PowerName } from './power'

export interface LeftBehind {
  gemsLeft: number
  bestGemLeft: GemGrade | null
  coinsLeft: number
  barrelsWhole: number
  powersUnused: { name: PowerName; said: string }[]
  breedsUnmet: string[]
  metTheDemonlord: boolean
  deepestFloor: number
}
