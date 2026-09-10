import type { RaidEnding } from '../types/raid'
import { homeRealm } from './realms'

const ledgerLivesAt = import.meta.env.VITE_THE_LEDGER_ADDRESS ?? ''

export const theLedgerTakesWrites = /^0x[0-9a-fA-F]{40}$/.test(ledgerLivesAt)

const whatWeSay = [
  'function postBond(uint256 pactId) payable',
  'function bondFor(address raider) view returns (uint256)',
  'function bondOnPact(uint256 pactId) view returns (uint256)',
  'function settleRaid(uint256 pactId, uint8 ending, uint256 coinsCarried)'
]

const walkedOut = 0
const fell = 1

interface Signed {
  hash: string
  wait(): Promise<unknown>
}

interface LedgerWeCanWriteTo {
  postBond(pactId: number, opts: { value: bigint }): Promise<Signed>
  bondFor(raider: string): Promise<bigint>
  bondOnPact(pactId: number): Promise<bigint>
  settleRaid(pactId: number, ending: number, coinsCarried: bigint): Promise<Signed>
}

async function reachTheLedgerWithYourPurse(): Promise<{
  ledger: LedgerWeCanWriteTo
  you: string
}> {
  if (!theLedgerTakesWrites) {
    throw new Error('no ledger is deployed to write to')
  }

  if (!window.ethereum) {
    throw new Error('no purse to sign with')
  }

  const { BrowserProvider, Contract } = await import('ethers')

  const provider = new BrowserProvider(window.ethereum)
  const realm = await provider.getNetwork()

  if (Number(realm.chainId) !== homeRealm.chainNumber) {
    throw new Error(`your purse must be on ${homeRealm.name} to sign this`)
  }

  const signer = await provider.getSigner()
  const ledger = new Contract(ledgerLivesAt, whatWeSay, signer)

  return { ledger: ledger as unknown as LedgerWeCanWriteTo, you: await signer.getAddress() }
}

export interface BondPosted {
  txHash: string
  locked: string
}

export async function lockUpYourBond(pactId: number): Promise<BondPosted | null> {
  const { ledger, you } = await reachTheLedgerWithYourPurse()
  const { formatEther } = await import('ethers')

  const alreadyDown = await ledger.bondOnPact(pactId)

  if (alreadyDown > 0n) {
    return null
  }

  const wanted = await ledger.bondFor(you)

  if (wanted === 0n) {
    return null
  }

  const sent = await ledger.postBond(pactId, { value: wanted })
  await sent.wait()

  return { txHash: sent.hash, locked: formatEther(wanted) }
}

export interface RaidWrittenDown {
  txHash: string
}

export async function writeTheRaidToTheChain(
  pactId: number,
  ending: RaidEnding,
  coinsCarried: number
): Promise<RaidWrittenDown> {
  const { ledger } = await reachTheLedgerWithYourPurse()

  const sent = await ledger.settleRaid(
    pactId,
    ending === 'walked out' ? walkedOut : fell,
    BigInt(Math.max(0, Math.round(coinsCarried)))
  )

  await sent.wait()

  return { txHash: sent.hash }
}

export function lookUpOnCreditcoin(txHash: string): string {
  return `${homeRealm.explorerAddress}/tx/${txHash}`
}
