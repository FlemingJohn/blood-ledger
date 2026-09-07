import { JsonRpcProvider, Wallet, formatEther, isAddress, parseEther } from 'ethers'

import type { HouseRealm, HouseSettings } from './settings'
import { hadTheirFill, takeItBack, tooSoonFor, whatTheyHaveHad, writeItDown } from './ledgerOfGiving'

export interface PurseSide {
  realm: string
  shortName: string
  coinSymbol: string
  houseHolds: string
  drip: string
  canGive: boolean
  why: string | null
}

export interface HandedOver {
  realm: string
  shortName: string
  coinSymbol: string
  coins: string
  txHash: string
  lookUpAt: string
}

export type WhyRefused = 'asked wrongly' | 'had enough' | 'too soon' | 'house is dry'

export interface HouseTrouble {
  trouble: string
  refused: WhyRefused
  waitMs?: number
}

function reach(realm: HouseRealm): { chain: JsonRpcProvider; purse: Wallet } {
  const chain = new JsonRpcProvider(realm.rpc)
  return { chain, purse: new Wallet(realm.key, chain) }
}

async function whatIsSpare(realm: HouseRealm): Promise<bigint> {
  const { chain, purse } = reach(realm)
  const held = await chain.getBalance(purse.address)
  const kept = parseEther(realm.keepsBack)

  return held > kept ? held - kept : 0n
}

export async function lookAtOneSide(realm: HouseRealm): Promise<PurseSide> {
  const { chain, purse } = reach(realm)

  try {
    const held = await chain.getBalance(purse.address)
    const spare = await whatIsSpare(realm)
    const drip = parseEther(realm.drip)

    return {
      realm: realm.name,
      shortName: realm.shortName,
      coinSymbol: realm.coinSymbol,
      houseHolds: formatEther(held),
      drip: realm.drip,
      canGive: spare >= drip,
      why: spare >= drip ? null : 'the house purse is empty'
    }
  } catch {
    return {
      realm: realm.name,
      shortName: realm.shortName,
      coinSymbol: realm.coinSymbol,
      houseHolds: '0',
      drip: realm.drip,
      canGive: false,
      why: 'the chain would not answer'
    }
  }
}

export async function whatTheyHold(realm: HouseRealm, address: string): Promise<string> {
  if (!isAddress(address)) {
    return '0'
  }

  try {
    const { chain } = reach(realm)
    return formatEther(await chain.getBalance(address))
  } catch {
    return '0'
  }
}

async function pourOneSide(realm: HouseRealm, toWhom: string): Promise<HandedOver> {
  const { purse } = reach(realm)
  const drip = parseEther(realm.drip)
  const spare = await whatIsSpare(realm)

  if (spare < drip) {
    throw new Error(`the house has no ${realm.coinSymbol} left to give`)
  }

  const sent = await purse.sendTransaction({ to: toWhom, value: drip })
  await sent.wait()

  return {
    realm: realm.name,
    shortName: realm.shortName,
    coinSymbol: realm.coinSymbol,
    coins: realm.drip,
    txHash: sent.hash,
    lookUpAt: `${realm.explorer}/tx/${sent.hash}`
  }
}

export async function fillAPurse(
  settings: HouseSettings,
  toWhom: string
): Promise<HandedOver[] | HouseTrouble> {
  if (!isAddress(toWhom)) {
    return { trouble: 'that is not an address', refused: 'asked wrongly' }
  }

  if (hadTheirFill(toWhom, settings.mostPerAddress)) {
    return {
      trouble: `the house gives each address ${settings.mostPerAddress} purses and no more`,
      refused: 'had enough'
    }
  }

  const waitMs = tooSoonFor(toWhom, settings.waitBetween)
  if (waitMs > 0) {
    return {
      trouble: 'the house has already filled that purse. Come back shortly.',
      refused: 'too soon',
      waitMs
    }
  }

  const wasAt = whatTheyHaveHad(toWhom).lastAt
  writeItDown(toWhom)

  const poured: HandedOver[] = []
  const refused: string[] = []

  for (const realm of [settings.sepolia, settings.creditcoin]) {
    try {
      poured.push(await pourOneSide(realm, toWhom))
    } catch (trouble) {
      refused.push(`${realm.shortName}: ${(trouble as Error).message}`)
    }
  }

  if (poured.length === 0) {
    takeItBack(toWhom, wasAt)
    return {
      trouble: refused.join(' · ') || 'the house could not pour anything',
      refused: 'house is dry'
    }
  }

  return poured
}
