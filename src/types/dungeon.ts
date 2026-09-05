export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type Move = 'walk' | 'attack' | 'death'

export type Spot = { x: number; y: number }

export interface Standing {
  spot: Spot
  facing: Facing
}

export type PropKind =
  | 'wall1'
  | 'wall2'
  | 'column'
  | 'barrel'
  | 'crate'
  | 'bones'
  | 'rubble'
  | 'mushrooms'

export interface StandingProp {
  kind: PropKind
  spot: Spot
  blocks: boolean
}

export type LootKind = 'coins' | 'gem'

export interface Loot {
  kind: LootKind
  spot: Spot
  worth: number
  taken: boolean
}

export interface FloorPlan {
  width: number
  height: number
  props: StandingProp[]
  loot: Loot[]
  enemySpots: { kind: 'skeleton' | 'slime'; spot: Spot }[]
  bossSpot: Spot | null
  startSpot: Spot
}
