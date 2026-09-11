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

export function plainly(trouble: unknown): string {
  const said = trouble instanceof Error ? trouble.message : String(trouble)
  const code = (trouble as { code?: unknown } | null)?.code

  if (code === youTurnedItAway || code === 'ACTION_REJECTED') {
    return 'you turned the purse away'
  }
  if (said.includes('NoBondPosted')) {
    return 'the bond was never locked up'
  }
  if (said.includes('BondIsWrong')) {
    return 'the bond asked of you changed while you were reading. Try again.'
  }
  if (said.includes('PactAlreadySettled')) {
    return 'this raid is already written down'
  }
  if (said.includes('NotYourPact')) {
    return 'that pact belongs to somebody else'
  }
  if (said.includes('MoreThanTheDungeonHolds')) {
    return 'the ledger will not write down a haul that large'
  }
  if (said.includes('insufficient funds') || said.includes('estimateGas')) {
    return 'your purse cannot cover it'
  }

  return said.length > 90 ? 'the chain would not take it' : said
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
