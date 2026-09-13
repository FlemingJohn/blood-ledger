import type { Realm } from '../types/realm'

export interface PurseHolding {
  wei: bigint
  said: string
}

function trimmed(wei: bigint): string {
  const whole = wei / 10n ** 18n
  const rest = wei % 10n ** 18n

  if (whole >= 100n) {
    return String(whole)
  }

  const four = String(rest).padStart(18, '0').slice(0, 4)
  return `${whole}.${four}`.replace(/\.?0+$/, '') || '0'
}

export async function whatThePurseHolds(
  realm: Realm,
  address: string
): Promise<PurseHolding | null> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return null
  }

  try {
    const { JsonRpcProvider } = await import('ethers')
    const chain = new JsonRpcProvider(realm.rpcAddress)
    const wei = await chain.getBalance(address)

    return { wei, said: trimmed(wei) }
  } catch {
    return null
  }
}
