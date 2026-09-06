export interface AttestedBlock {
  chainKey: number
  height: number
  digest: string
  isAttestation: boolean
}

export type SeedSource = 'attested' | 'made up'

export interface DungeonSeed {
  seed: string
  source: SeedSource
  attested: AttestedBlock | null
}
