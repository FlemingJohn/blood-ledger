import { config } from 'dotenv'

config()

export interface Settings {
  sourceChainRpc: string
  sourceChainKey: number
  patronVault: string
  creditcoinRpc: string
  theLedger: string
  keeperKey: string
  proofBuilderUrl: string
  lookBackBlocks: number
  pollEvery: number
}

function needed(name: string): string {
  const held = process.env[name]
  if (!held || held.trim().length === 0) {
    throw new Error(`${name} is not set. Copy worker/.env.example to .env and fill it in.`)
  }
  return held.trim()
}

function neededNumber(name: string): number {
  const asWords = needed(name)
  const asNumber = Number(asWords)
  if (!Number.isFinite(asNumber)) {
    throw new Error(`${name} must be a number, not "${asWords}"`)
  }
  return asNumber
}

function orElse(name: string, fallback: number): number {
  const held = process.env[name]
  if (!held) {
    return fallback
  }
  const asNumber = Number(held)
  return Number.isFinite(asNumber) ? asNumber : fallback
}

export function readSettings(): Settings {
  return {
    sourceChainRpc: needed('SOURCE_CHAIN_RPC_URL'),
    sourceChainKey: neededNumber('SOURCE_CHAIN_KEY'),
    patronVault: needed('PATRON_VAULT_ADDRESS'),
    creditcoinRpc: needed('CREDITCOIN_RPC_URL'),
    theLedger: needed('THE_LEDGER_ADDRESS'),
    keeperKey: needed('CREDITCOIN_WALLET_PRIVATE_KEY'),
    proofBuilderUrl: needed('PROOF_BUILDER_URL'),
    lookBackBlocks: orElse('LOOK_BACK_BLOCKS', 0),
    pollEvery: orElse('POLL_EVERY_MS', 12_000)
  }
}
