import type { Deed, PatronRecord } from '../types/profile'
import { readTheLastStakes, theVaultIsDeployed } from './coinPutUp'
import { coinsFromEther } from './coinRate'

const ledgerLivesAt = import.meta.env.VITE_THE_LEDGER_ADDRESS ?? ''
const creditcoinAnswersAt =
  import.meta.env.VITE_CREDITCOIN_RPC ?? 'https://rpc.cc3-testnet.creditcoin.network'

const theLedgerWasBornAt = Number(import.meta.env.VITE_LEDGER_FIRST_BLOCK ?? '5451467')
const mostBlocksAtOnce = 10_000
const mostStakesWeWalk = 50
const deedsKept = 12
const walkedOut = 0

const settlements = [
  'event RaidSettled(uint256 indexed pactId, address indexed raider, address indexed patron, uint8 ending, uint256 coinsCarried, uint256 patronTakes, uint256 raiderKeeps, bool debtCleared, uint32 standingAfter)'
]

export interface RaidTheChainSaw {
  pactId: number
  raiderAddress: string
  patronAddress: string
  walkedOut: boolean
  patronTook: number
  raiderKept: number
  at: number
}

async function everySettlement(): Promise<RaidTheChainSaw[]> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(ledgerLivesAt)) {
    return []
  }

  try {
    const { JsonRpcProvider, Contract, formatEther } = await import('ethers')

    const creditcoin = new JsonRpcProvider(creditcoinAnswersAt)
    const ledger = new Contract(ledgerLivesAt, settlements, creditcoin)
    const head = await creditcoin.getBlockNumber()

    const written = []

    for (let from = theLedgerWasBornAt; from <= head; from += mostBlocksAtOnce) {
      const to = Math.min(head, from + mostBlocksAtOnce - 1)
      const asked = ledger.filters.RaidSettled
      written.push(...(await ledger.queryFilter(asked ? asked() : 'RaidSettled', from, to)))
    }

    return await Promise.all(
      written.map(async (one) => {
        const said = (one as unknown as { args: Record<string, unknown> }).args
        const block = await one.getBlock()

        return {
          pactId: Number(said.pactId),
          raiderAddress: String(said.raider),
          patronAddress: String(said.patron),
          walkedOut: Number(said.ending) === walkedOut,
          patronTook: coinsFromEther(formatEther(said.patronTakes as bigint)),
          raiderKept: coinsFromEther(formatEther(said.raiderKeeps as bigint)),
          at: block.timestamp * 1000
        }
      })
    )
  } catch {
    return []
  }
}

let remembering: Promise<RaidTheChainSaw[]> | null = null

function everySettlementOnce(): Promise<RaidTheChainSaw[]> {
  if (!remembering) {
    remembering = everySettlement()
  }
  return remembering
}

export function forgetWhatWeRead(): void {
  remembering = null
}

export interface WhatTheChainSaysAboutYou {
  coinKept: number
  asPatron: PatronRecord
  deeds: Deed[]
}

export async function readWhatTheChainRemembers(
  address: string
): Promise<WhatTheChainSaysAboutYou | null> {
  if (!theVaultIsDeployed) {
    return null
  }

  const you = address.toLowerCase()

  const [settled, staked] = await Promise.all([
    everySettlementOnce(),
    readTheLastStakes(mostStakesWeWalk)
  ])

  const stakedOn = new Map(
    staked.map((stake) => [stake.pactId, coinsFromEther(stake.coinsStaked)])
  )

  function whatWasPutUp(pactId: number): number {
    return stakedOn.get(pactId) ?? 0
  }

  const yoursAsRaider = settled.filter((raid) => raid.raiderAddress.toLowerCase() === you)
  const yoursAsPatron = settled.filter((raid) => raid.patronAddress.toLowerCase() === you)
  const youStaked = staked.filter((stake) => stake.patronAddress.toLowerCase() === you)

  const deeds: Deed[] = []

  yoursAsRaider.forEach((raid) => {
    deeds.push({
      side: 'raider',
      outcome: raid.walkedOut ? 'walked out' : 'fell',
      floorReached: null,
      coinChange: raid.walkedOut ? raid.raiderKept : -whatWasPutUp(raid.pactId),
      otherSide: raid.patronAddress,
      minutesAgo: sinceThen(raid.at)
    })
  })

  yoursAsPatron.forEach((raid) => {
    deeds.push({
      side: 'patron',
      outcome: raid.walkedOut ? 'walked out' : 'fell',
      floorReached: null,
      coinChange: raid.walkedOut
        ? raid.patronTook - whatWasPutUp(raid.pactId)
        : -whatWasPutUp(raid.pactId),
      otherSide: raid.raiderAddress,
      minutesAgo: sinceThen(raid.at)
    })
  })

  deeds.sort((one, other) => one.minutesAgo - other.minutesAgo)

  const profit = yoursAsPatron.reduce(
    (running, raid) =>
      running + (raid.walkedOut ? raid.patronTook : 0) - whatWasPutUp(raid.pactId),
    0
  )

  return {
    coinKept: yoursAsRaider.reduce((running, raid) => running + raid.raiderKept, 0),
    asPatron: {
      backed: youStaked.length,
      returned: yoursAsPatron.filter((raid) => raid.walkedOut).length,
      lost: yoursAsPatron.filter((raid) => !raid.walkedOut).length,
      profit
    },
    deeds: deeds.slice(0, deedsKept)
  }
}

function sinceThen(at: number): number {
  return Math.max(0, Math.round((Date.now() - at) / 60_000))
}
