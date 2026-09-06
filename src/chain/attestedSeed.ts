import type { AttestedBlock, DungeonSeed } from '../types/attestation'
import { homeRealm, realmWherePatronsPay } from './realms'
import { madeUpSeed } from '../dungeon/seed'

const sepoliaChainKey = 1

export async function readAttestedBlock(): Promise<AttestedBlock | null> {
  try {
    const [{ JsonRpcProvider }, { chainInfo }] = await Promise.all([
      import('ethers'),
      import('@gluwa/usc-sdk')
    ])

    const creditcoin = new JsonRpcProvider(homeRealm.rpcAddress)
    const info = new chainInfo.PrecompileChainInfoProvider(creditcoin)
    const latest = await info.getLatestAttestedHeightAndHash(sepoliaChainKey)

    if (!latest.exists) {
      return null
    }

    return {
      chainKey: sepoliaChainKey,
      height: Number(latest.height),
      digest: latest.hash,
      isAttestation: latest.isAttestation
    }
  } catch {
    return null
  }
}

export async function seedForTheDescent(): Promise<DungeonSeed> {
  const attested = await readAttestedBlock()

  if (!attested) {
    return { seed: madeUpSeed(), source: 'made up', attested: null }
  }

  return {
    seed: attested.digest,
    source: 'attested',
    attested
  }
}

export function whereToCheckIt(attested: AttestedBlock | null): string | null {
  if (!attested) {
    return null
  }
  return `${realmWherePatronsPay.explorerAddress}/block/${attested.height}`
}
