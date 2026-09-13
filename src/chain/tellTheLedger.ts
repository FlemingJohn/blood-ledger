import type { RaidEnding } from '../types/raid'
import { homeRealm } from './realms'
import { weiFromCoins } from './coinRate'

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

const youTurnedItAway = 4001

const inTheLedgersWords: [string, string][] = [
  ['NoSuchPact', 'no pact stands in your name'],
  ['NotYourPact', 'that pact belongs to another raider'],
  ['PactAlreadySettled', 'that raid is already written down'],
  ['RaiderAlreadyOwes', 'you already owe on a pact, and cannot take another until it settles'],
  ['BondAlreadyPosted', 'your bond is already locked up'],
  ['NoBondPosted', 'the bond was never locked up'],
  ['BondIsWrong', 'the bond asked of you changed while you read. Look again.'],
  ['CouldNotMoveTheBond', 'the bond would not move'],
  ['MoreThanTheDungeonHolds', 'the ledger will not write down a haul that large'],
  ['Query already processed', 'that proof has already been spent']
]

export function plainly(trouble: unknown): string {
  const said = trouble instanceof Error ? trouble.message : String(trouble)
  const code = (trouble as { code?: unknown } | null)?.code

  if (code === youTurnedItAway || code === 'ACTION_REJECTED') {
    return 'you turned the purse away'
  }

  for (const [named, plain] of inTheLedgersWords) {
    if (said.includes(named)) {
      return plain
    }
  }

  if (said.includes('insufficient funds')) {
    return `your purse has not enough ${homeRealm.coinSymbol} for the bond and its cost`
  }
  if (said.includes('network changed') || said.includes('could not coalesce')) {
    return `your purse wandered out of ${homeRealm.name} while that was signing`
  }
  if (said.includes('nonce') || said.includes('replacement')) {
    return 'the chain is still chewing your last deed. Wait a breath and try again.'
  }
  if (said.includes('timeout') || said.includes('TIMEOUT')) {
    return 'the chain did not answer in time'
  }

  return 'the ledger would not take it'
}

async function reachTheLedgerWithYourPurse(): Promise<{
  ledger: LedgerWeCanWriteTo
  you: string
  purse: { getBalance(who: string): Promise<bigint> }
}> {
  if (!theLedgerTakesWrites) {
    throw new Error('no ledger is deployed to write to')
  }

  if (!window.ethereum) {
    throw new Error('you have no purse to put a seal to this')
  }

  const { BrowserProvider, Contract } = await import('ethers')

  const provider = new BrowserProvider(window.ethereum)
  const realm = await provider.getNetwork()

  if (Number(realm.chainId) !== homeRealm.chainNumber) {
    throw new Error(`your purse must be on ${homeRealm.name} to sign this`)
  }

  const signer = await provider.getSigner()
  const ledger = new Contract(ledgerLivesAt, whatWeSay, signer)

  return {
    ledger: ledger as unknown as LedgerWeCanWriteTo,
    you: await signer.getAddress(),
    purse: provider
  }
}

export interface BondPosted {
  txHash: string
  locked: string
}

export async function lockUpYourBond(pactId: number): Promise<BondPosted | null> {
  const { ledger, you, purse } = await reachTheLedgerWithYourPurse()
  const { formatEther } = await import('ethers')

  const alreadyDown = await ledger.bondOnPact(pactId)

  if (alreadyDown > 0n) {
    return null
  }

  const wanted = await ledger.bondFor(you)

  if (wanted === 0n) {
    return null
  }

  const held = await purse.getBalance(you)

  if (held < wanted) {
    throw new Error(
      `the bond is ${formatEther(wanted)} ${homeRealm.coinSymbol} and your purse holds ${formatEther(held)}`
    )
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
    weiFromCoins(coinsCarried)
  )

  await sent.wait()

  return { txHash: sent.hash }
}

export function lookUpOnCreditcoin(txHash: string): string {
  return `${homeRealm.explorerAddress}/tx/${txHash}`
}
