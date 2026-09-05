export type PurseStanding =
  | 'no purse found'
  | 'ready to open'
  | 'waiting on you'
  | 'wrong realm'
  | 'opened'
  | 'you refused'
  | 'something broke'

export interface PurseReading {
  standing: PurseStanding
  address: string | null
  chainNumber: number | null
  trouble: string | null
}

export type PurseWatcher = (reading: PurseReading) => void

export interface PurseKeeper {
  read(): PurseReading
  open(): Promise<PurseReading>
  moveToHomeRealm(): Promise<PurseReading>
  watch(listener: PurseWatcher): () => void
}
