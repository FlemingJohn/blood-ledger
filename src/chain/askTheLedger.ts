import type { Standing } from '../types/raider'
import { gradeFromScore } from './theLedger'

const ledgerLivesAt = import.meta.env.VITE_THE_LEDGER_ADDRESS ?? ''
const creditcoinAnswersAt =
  import.meta.env.VITE_CREDITCOIN_RPC ?? 'https://rpc.cc3-testnet.creditcoin.network'

export const theLedgerIsDeployed = /^0x[0-9a-fA-F]{40}$/.test(ledgerLivesAt)

const whatWeAsk = [
  'function standingOf(address raider) view returns (tuple(uint32 score, uint32 raids, uint32 repaid, uint32 lost, bool known))',
  'function bondFor(address raider) view returns (uint256)',
  'function openPactOf(address raider) view returns (uint256)',
  'function pactsBetween(address patron, address raider) view returns (uint32)',
  'function earnedFromThisPair(address patron, address raider) view returns (uint32)',
  'function pacts(uint256 pactId) view returns (address raider, address patron, uint256 pactId, uint256 coinsStaked, uint16 patronShare, bool sealed_, bool settled)'
]

interface LedgerAnswers {
  standingOf(raider: string): Promise<{
    score: bigint
    raids: bigint
    repaid: bigint
    lost: bigint
    known: boolean
  }>
  bondFor(raider: string): Promise<bigint>
  openPactOf(raider: string): Promise<bigint>
  pactsBetween(patron: string, raider: string): Promise<bigint>
  earnedFromThisPair(patron: string, raider: string): Promise<bigint>
  pacts(pactId: bigint): Promise<{
    patron: string
    coinsStaked: bigint
    patronShare: bigint
    settled: boolean
  }>
}

let reaching: Promise<LedgerAnswers | null> | null = null

async function reachTheLedger(): Promise<LedgerAnswers | null> {
  if (!theLedgerIsDeployed) {
    return null
  }

  try {
    const { JsonRpcProvider, Contract } = await import('ethers')
    const creditcoin = new JsonRpcProvider(creditcoinAnswersAt)
    const ledger = new Contract(ledgerLivesAt, whatWeAsk, creditcoin)

    return ledger as unknown as LedgerAnswers
  } catch {
    return null
  }
}

function held(): Promise<LedgerAnswers | null> {
  if (!reaching) {
    reaching = reachTheLedger()
  }
  return reaching
}

export interface StandingOnChain {
  standing: Standing
  known: boolean
}

export async function standingFromTheChain(address: string): Promise<StandingOnChain | null> {
  const ledger = await held()

  if (!ledger) {
    return null
  }

  try {
    const told = await ledger.standingOf(address)

    const score = Number(told.score)

    return {
      known: told.known,
      standing: {
        score,
        grade: gradeFromScore(score),
        raids: Number(told.raids),
        repaid: Number(told.repaid),
        lost: Number(told.lost)
      }
    }
  } catch {
    return null
  }
}

export async function bondFromTheChain(address: string): Promise<number | null> {
  const ledger = await held()

  if (!ledger) {
    return null
  }

  try {
    const owed = await ledger.bondFor(address)
    return Number(owed) / 1e18
  } catch {
    return null
  }
}

export interface PactOnChain {
  pactId: number
  patronAddress: string
  coinsStaked: number
  patronShare: number
  settled: boolean
}

export async function openPactFromTheChain(address: string): Promise<PactOnChain | null> {
  const ledger = await held()

  if (!ledger) {
    return null
  }

  try {
    const which = await ledger.openPactOf(address)

    if (Number(which) === 0) {
      return null
    }

    const pact = await ledger.pacts(which)

    return {
      pactId: Number(which),
      patronAddress: pact.patron,
      coinsStaked: Number(pact.coinsStaked),
      patronShare: Number(pact.patronShare),
      settled: pact.settled
    }
  } catch {
    return null
  }
}

export interface HowOftenThisPair {
  times: number
  wouldEarn: number
}

export async function timesThisPairHaveDealt(
  patron: string,
  raider: string
): Promise<HowOftenThisPair | null> {
  const ledger = await held()

  if (!ledger) {
    return null
  }

  try {
    const [times, earning] = await Promise.all([
      ledger.pactsBetween(patron, raider),
      ledger.earnedFromThisPair(patron, raider)
    ])

    return {
      times: Number(times),
      wouldEarn: Number(earning)
    }
  } catch {
    return null
  }
}
