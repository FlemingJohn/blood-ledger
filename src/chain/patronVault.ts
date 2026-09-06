import type { StakeYouMade, StakingProgress, WhatYouOffer } from '../types/patron'
import { realmWherePatronsPay } from './realms'

const vaultAddress = import.meta.env.VITE_PATRON_VAULT_ADDRESS ?? ''

const vaultReads = [
  'function fundRaid(address raider, uint16 patronShare) payable returns (uint256)',
  'function MOST_A_PATRON_MAY_KEEP() view returns (uint16)',
  'event RaidFunded(address indexed raider, address indexed patron, uint256 pactId, uint256 coinsStaked, uint16 patronShare)'
]

export const vaultIsDeployed = /^0x[0-9a-fA-F]{40}$/.test(vaultAddress)

export const mostAPatronMayKeep = 80

export function whereTheVaultLives(): string {
  return vaultAddress
}

export function lookUpStake(txHash: string): string {
  return `${realmWherePatronsPay.explorerAddress}/tx/${txHash}`
}

async function reachTheVault(): Promise<{ vault: unknown; signerAddress: string }> {
  const { BrowserProvider, Contract } = await import('ethers')

  if (!window.ethereum) {
    throw new Error('no purse to sign with')
  }

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const vault = new Contract(vaultAddress, vaultReads, signer)

  return { vault, signerAddress: await signer.getAddress() }
}

export async function stakeOnARaider(
  offer: WhatYouOffer,
  tell: (progress: StakingProgress) => void
): Promise<StakeYouMade> {
  if (!vaultIsDeployed) {
    throw new Error('no vault is deployed yet, so nothing can be staked')
  }

  const { parseEther, isAddress } = await import('ethers')

  if (!isAddress(offer.raider)) {
    throw new Error('that is not an address')
  }
  if (offer.patronShare > mostAPatronMayKeep) {
    throw new Error(`a patron may keep at most ${mostAPatronMayKeep} percent`)
  }

  const coins = parseEther(offer.coins)
  if (coins <= 0n) {
    throw new Error('a stake of nothing buys nothing')
  }

  tell({ step: 'waiting on your purse', txHash: null, trouble: null })

  const { vault } = await reachTheVault()
  const contract = vault as {
    fundRaid: (raider: string, share: number, opts: { value: bigint }) => Promise<{
      hash: string
      wait: () => Promise<unknown>
    }>
  }

  const sent = await contract.fundRaid(offer.raider, offer.patronShare, { value: coins })

  tell({ step: 'coin is leaving ethereum', txHash: sent.hash, trouble: null })

  await sent.wait()

  tell({ step: 'witnesses are agreeing', txHash: sent.hash, trouble: null })

  return {
    pactId: '',
    raider: offer.raider,
    coinsStaked: offer.coins,
    patronShare: offer.patronShare,
    txHash: sent.hash,
    stakedAt: Date.now()
  }
}
