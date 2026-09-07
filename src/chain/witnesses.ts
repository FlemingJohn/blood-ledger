import type { WatchedChain, WitnessReading } from '../types/witnesses'
import { homeRealm, realmWherePatronsPay } from './realms'

const payingChainKey = 1
const secondsPerBlock = 12
const sepoliaOpenRpc = 'https://ethereum-sepolia-rpc.publicnode.com'

const silence: WitnessReading = {
  chains: [],
  paying: null,
  blocksBehind: null,
  minutesBehind: null,
  reachable: false
}

function readNameFrom(raw: string): string {
  if (!raw.startsWith('0x')) {
    return raw
  }

  const letters = raw.slice(2).match(/.{1,2}/g) ?? []
  const said = letters.map((pair) => String.fromCharCode(Number.parseInt(pair, 16))).join('')

  return said.replace(/\s+ethereum$/i, '').trim() || raw
}

async function askTheSepoliaHead(): Promise<number | null> {
  try {
    const answer = await fetch(sepoliaOpenRpc, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
    })

    const said = (await answer.json()) as { result?: string }
    return said.result ? Number.parseInt(said.result, 16) : null
  } catch {
    return null
  }
}

export async function readTheWitnesses(): Promise<WitnessReading> {
  try {
    const [{ JsonRpcProvider }, { chainInfo }] = await Promise.all([
      import('ethers'),
      import('@gluwa/usc-sdk')
    ])

    const creditcoin = new JsonRpcProvider(homeRealm.rpcAddress)
    const info = new chainInfo.PrecompileChainInfoProvider(creditcoin)

    const supported = await info.getSupportedChains()

    const chains: WatchedChain[] = []

    for (const one of supported) {
      const latest = await info.getLatestAttestedHeightAndHash(one.chainKey)
      if (!latest.exists) {
        continue
      }
      chains.push({
        chainKey: one.chainKey,
        name: readNameFrom(String(one.chainName)),
        height: Number(latest.height)
      })
    }

    const paying = chains.find((one) => one.chainKey === payingChainKey) ?? null

    if (!paying) {
      return { chains, paying: null, blocksBehind: null, minutesBehind: null, reachable: true }
    }

    const head = await askTheSepoliaHead()

    if (head === null) {
      return { chains, paying, blocksBehind: null, minutesBehind: null, reachable: true }
    }

    const behind = Math.max(0, head - paying.height)

    return {
      chains,
      paying,
      blocksBehind: behind,
      minutesBehind: Math.max(0, Math.round((behind * secondsPerBlock) / 60)),
      reachable: true
    }
  } catch {
    return silence
  }
}

export function whereThePayingChainIs(): string {
  return realmWherePatronsPay.shortName
}
