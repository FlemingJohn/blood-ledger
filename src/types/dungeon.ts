import type { BreedName } from './breed'

export type Facing = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type Move = 'walk' | 'attack' | 'death'

export type Spot = { x: number; y: number }

export type PropKind =
  | 'wall1'
  | 'wall2'
  | 'wall3'
  | 'bricks'
  | 'tiles'
  | 'column'
  | 'column2'
  | 'barrel'
  | 'crate'
  | 'bones'
  | 'bones2'
  | 'bones3'
  | 'rubble'
  | 'mushrooms'
  | 'brazier'
  | 'torch'

export type BreakableKind = 'barrel' | 'crate'

export interface StandingProp {
  kind: PropKind
  spot: Spot
  breakable: boolean
  broken: boolean
  brokeAt: number
  life: number
}

export interface Torchlight {
  spot: Spot
  frame: number
}

export type GemGrade = 'white' | 'green' | 'blue' | 'red'

export type LootKind = 'coins' | 'gem'

export interface Loot {
  kind: LootKind
  grade: GemGrade | null
  spot: Spot
  worth: number
  taken: boolean
  bornAt: number
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
  lights: Torchlight[]
  loot: Loot[]
  enemySpots: { breed: BreedName; spot: Spot }[]
  bossSpot: Spot | null
  startSpot: Spot
  width: number
  height: number
  shape: string
}
