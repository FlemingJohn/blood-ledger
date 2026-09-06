import type { InjectedPurse } from '../types/injected'
import type { PurseKeeper, PurseReading, PurseWatcher } from '../types/purse'
import type { Realm } from '../types/realm'
import { chainNumberAsHex, homeRealm } from './realms'

const refusedByPlayer = 4001
const realmUnknownToPurse = 4902
const realmMissingLegacy = -32603

function findInjectedPurse(): InjectedPurse | null {
  return window.ethereum ?? null
}

function readChainNumber(raw: unknown): number | null {
  if (typeof raw === 'string') {
    const parsed = Number.parseInt(raw, 16)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof raw === 'number') {
    return raw
  }
  return null
}

function firstAddress(raw: unknown): string | null {
  if (!Array.isArray(raw)) {
    return null
  }
  const candidate = raw[0]
  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null
}

function errorCode(trouble: unknown): number | null {
  if (typeof trouble === 'object' && trouble !== null && 'code' in trouble) {
    const code = (trouble as { code: unknown }).code
    return typeof code === 'number' ? code : null
  }
  return null
}

function errorWords(trouble: unknown): string {
  if (trouble instanceof Error) {
    return trouble.message
  }
  return 'The purse would not answer.'
}

export function keepPurse(wantedRealm: Realm = homeRealm): PurseKeeper {
  const purse = findInjectedPurse()

  let reading: PurseReading = purse
    ? { standing: 'ready to open', address: null, chainNumber: null, trouble: null }
    : { standing: 'no purse found', address: null, chainNumber: null, trouble: null }

  const watchers = new Set<PurseWatcher>()

  function announce(next: PurseReading): PurseReading {
    reading = next
    watchers.forEach((listener) => listener(reading))
    return reading
  }

  function settleStanding(address: string | null, chainNumber: number | null): PurseReading {
    if (!address) {
      return announce({ standing: 'ready to open', address: null, chainNumber, trouble: null })
    }
    if (chainNumber !== wantedRealm.chainNumber) {
      return announce({ standing: 'wrong realm', address, chainNumber, trouble: null })
    }
    return announce({ standing: 'opened', address, chainNumber, trouble: null })
  }

  async function askForChainNumber(): Promise<number | null> {
    if (!purse) {
      return null
    }
    return readChainNumber(await purse.request({ method: 'eth_chainId' }))
  }

  async function addWantedRealm(): Promise<void> {
    if (!purse) {
      return
    }
    await purse.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: chainNumberAsHex(wantedRealm),
          chainName: wantedRealm.name,
          rpcUrls: [wantedRealm.rpcAddress],
          blockExplorerUrls: [wantedRealm.explorerAddress],
          nativeCurrency: {
            name: wantedRealm.coinName,
            symbol: wantedRealm.coinSymbol,
            decimals: wantedRealm.coinDecimals
          }
        }
      ]
    })
  }

  async function noticeAlreadyOpen(): Promise<void> {
    if (!purse) {
      return
    }

    try {
      const address = firstAddress(await purse.request({ method: 'eth_accounts' }))

      if (address) {
        settleStanding(address, await askForChainNumber())
      }
    } catch {
      return
    }
  }

  if (purse) {
    purse.on('accountsChanged', (...payload: unknown[]) => {
      settleStanding(firstAddress(payload[0]), reading.chainNumber)
    })
    purse.on('chainChanged', (...payload: unknown[]) => {
      settleStanding(reading.address, readChainNumber(payload[0]))
    })
    void noticeAlreadyOpen()
  }

  return {
    read(): PurseReading {
      return reading
    },

    async open(): Promise<PurseReading> {
      if (!purse) {
        return announce({
          standing: 'no purse found',
          address: null,
          chainNumber: null,
          trouble: null
        })
      }

      announce({ ...reading, standing: 'waiting on you', trouble: null })

      try {
        const address = firstAddress(await purse.request({ method: 'eth_requestAccounts' }))
        const chainNumber = await askForChainNumber()
        return settleStanding(address, chainNumber)
      } catch (trouble) {
        if (errorCode(trouble) === refusedByPlayer) {
          return announce({
            standing: 'you refused',
            address: null,
            chainNumber: reading.chainNumber,
            trouble: null
          })
        }
        return announce({
          standing: 'something broke',
          address: reading.address,
          chainNumber: reading.chainNumber,
          trouble: errorWords(trouble)
        })
      }
    },

    async moveToWantedRealm(): Promise<PurseReading> {
      if (!purse) {
        return reading
      }

      announce({ ...reading, standing: 'waiting on you', trouble: null })

      try {
        await purse.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainNumberAsHex(wantedRealm) }]
        })
        return settleStanding(reading.address, await askForChainNumber())
      } catch (trouble) {
        const code = errorCode(trouble)

        if (code === realmUnknownToPurse || code === realmMissingLegacy) {
          try {
            await addWantedRealm()
            return settleStanding(reading.address, await askForChainNumber())
          } catch (addingTrouble) {
            return announce({
              standing: 'wrong realm',
              address: reading.address,
              chainNumber: reading.chainNumber,
              trouble: errorWords(addingTrouble)
            })
          }
        }

        if (code === refusedByPlayer) {
          return announce({ ...reading, standing: 'wrong realm', trouble: null })
        }

        return announce({
          standing: 'wrong realm',
          address: reading.address,
          chainNumber: reading.chainNumber,
          trouble: errorWords(trouble)
        })
      }
    },

    watch(listener: PurseWatcher): () => void {
      watchers.add(listener)
      listener(reading)
      return () => {
        watchers.delete(listener)
      }
    }
  }
}
