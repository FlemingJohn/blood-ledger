export interface WatchedChain {
  chainKey: number
  name: string
  height: number
}

export interface WitnessReading {
  chains: WatchedChain[]
  paying: WatchedChain | null
  blocksBehind: number | null
  minutesBehind: number | null
  reachable: boolean
}
