export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type Move = 'walk' | 'attack' | 'death'

export type Spot = { x: number; y: number }

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
}

export type LootKind = 'coins' | 'gem'

export interface Loot {
  kind: LootKind
  spot: Spot
  worth: number
  taken: boolean
}

export interface Chamber {
  left: number
  top: number
  wide: number
  tall: number
}

export interface FloorPlan {
  tileSize: number
  across: number
  down: number
  walkable: boolean[]
  chambers: Chamber[]
  props: StandingProp[]
  loot: Loot[]
  enemySpots: { kind: 'skeleton' | 'slime'; spot: Spot }[]
  bossSpot: Spot | null
  startSpot: Spot
  width: number
  height: number
  shape: string
}
