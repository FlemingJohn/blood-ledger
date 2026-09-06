export type BreedName =
  | 'skeleton'
  | 'boneChampion'
  | 'frostRisen'
  | 'gildedDead'
  | 'slime'
  | 'kingSlime'
  | 'bloodSlime'
  | 'lesserDemon'
  | 'demonlord'

export interface Breed {
  name: BreedName
  said: string
  drawnAs: 'skeleton' | 'slime' | 'demonlord'
  life: number
  hurts: number
  reach: number
  pace: number
  swell: number
  tint: string | null
  coinBonus: number
  fromFloor: number
  rarity: number
}
