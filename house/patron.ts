import { Contract, JsonRpcProvider, Wallet, formatEther, isAddress, parseEther } from 'ethers'

import type { HouseSettings } from './settings'
import type { HouseTrouble } from './purse'
import patronVaultBuilt from '../contracts/out/PatronVault.json' with { type: 'json' }

export interface HouseOffer {
  patronAddress: string
  coinsStaked: string
  coinSymbol: string
  patronShare: number
  words: string
  canBack: boolean
  why: string | null
}

export interface Backed {
  raider: string
  patronAddress: string
  coinsStaked: string
  patronShare: number
  txHash: string
  lookUpAt: string
}

const houseWords = 'The house backs anyone once. It expects nothing and forgives nothing.'

const alreadyBacked = new Set<string>()

function vaultIsNamed(settings: HouseSettings): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(settings.patronVault)
}

function reachSepolia(settings: HouseSettings): Wallet {
  const chain = new JsonRpcProvider(settings.sepolia.rpc)
  return new Wallet(settings.sepolia.key, chain)
}

export async function readTheHouseOffer(settings: HouseSettings): Promise<HouseOffer> {
  const patron = reachSepolia(settings)

  const offer: HouseOffer = {
    patronAddress: patron.address,
    coinsStaked: settings.stake,
    coinSymbol: settings.sepolia.coinSymbol,
    patronShare: settings.share,
    words: houseWords,
    canBack: false,
    why: null
  }

  if (!vaultIsNamed(settings)) {
    offer.why = 'the vault is not deployed yet, so the house cannot stake'
    return offer
  }

  try {
    const held = await (patron.provider as JsonRpcProvider).getBalance(patron.address)
    const wanted = parseEther(settings.stake) + parseEther(settings.sepolia.keepsBack)

    if (held < wanted) {
      offer.why = `the house holds ${formatEther(held)} ${settings.sepolia.coinSymbol} and cannot stake`
      return offer
    }

    offer.canBack = true
    return offer
  } catch {
    offer.why = 'Sepolia would not answer'
    return offer
  }
}

export async function backARaider(
  settings: HouseSettings,
  raider: string
): Promise<Backed | HouseTrouble> {
  if (!isAddress(raider)) {
    return { trouble: 'that is not an address', refused: 'asked wrongly' }
  }

  const offer = await readTheHouseOffer(settings)

  if (!offer.canBack) {
    return { trouble: offer.why ?? 'the house cannot stake right now', refused: 'house is dry' }
  }

  if (raider.toLowerCase() === offer.patronAddress.toLowerCase()) {
    return { trouble: 'the house will not fund itself', refused: 'asked wrongly' }
  }

  if (alreadyBacked.has(raider.toLowerCase())) {
    return {
      trouble: 'the house backs each raider once, and it has already backed you',
      refused: 'had enough'
    }
  }

  alreadyBacked.add(raider.toLowerCase())

  try {
    const patron = reachSepolia(settings)
    const vault = new Contract(settings.patronVault, patronVaultBuilt.abi, patron)

    const sent = await vault.fundRaid(raider, settings.share, {
      value: parseEther(settings.stake)
    })

    await sent.wait()

    return {
      raider,
      patronAddress: offer.patronAddress,
      coinsStaked: settings.stake,
      patronShare: settings.share,
      txHash: sent.hash,
      lookUpAt: `${settings.sepolia.explorer}/tx/${sent.hash}`
    }
  } catch (trouble) {
    alreadyBacked.delete(raider.toLowerCase())
    return { trouble: (trouble as Error).message, refused: 'house is dry' }
  }
}
