import { config } from 'dotenv'

config()

export interface HouseRealm {
  name: string
  shortName: string
  coinSymbol: string
  rpc: string
  key: string
  drip: string
  keepsBack: string
  explorer: string
}

export interface HouseSettings {
  sepolia: HouseRealm
  creditcoin: HouseRealm
  patronVault: string
  stake: string
  share: number
  mostPerAddress: number
  waitBetween: number
  port: number
  lettingIn: string
}

function needed(name: string): string {
  const held = process.env[name]
  if (!held || held.trim().length === 0) {
    throw new Error(`${name} is not set. Copy worker/.env.example to .env and fill it in.`)
  }
  return held.trim()
}

function orElse(name: string, fallback: string): string {
  const held = process.env[name]
  return held && held.trim().length > 0 ? held.trim() : fallback
}

function orElseNumber(name: string, fallback: number): number {
  const held = process.env[name]
  if (!held) {
    return fallback
  }
  const asNumber = Number(held)
  return Number.isFinite(asNumber) ? asNumber : fallback
}

export function readHouseSettings(): HouseSettings {
  return {
    sepolia: {
      name: 'Ethereum Sepolia',
      shortName: 'Sepolia',
      coinSymbol: 'ETH',
      rpc: needed('SOURCE_CHAIN_RPC_URL'),
      key: orElse('HOUSE_SEPOLIA_KEY', needed('SEPOLIA_WALLET_PRIVATE_KEY')),
      drip: orElse('HOUSE_DRIP_SEPOLIA', '0.02'),
      keepsBack: orElse('HOUSE_KEEPS_BACK_SEPOLIA', '0.01'),
      explorer: 'https://sepolia.etherscan.io'
    },
    creditcoin: {
      name: 'Creditcoin CC3 Testnet',
      shortName: 'CC3',
      coinSymbol: 'tCTC',
      rpc: needed('CREDITCOIN_RPC_URL'),
      key: orElse('HOUSE_CREDITCOIN_KEY', needed('CREDITCOIN_WALLET_PRIVATE_KEY')),
      drip: orElse('HOUSE_DRIP_CREDITCOIN', '0.15'),
      keepsBack: orElse('HOUSE_KEEPS_BACK_CREDITCOIN', '0.05'),
      explorer: 'https://creditcoin-testnet.blockscout.com'
    },
    patronVault: orElse('PATRON_VAULT_ADDRESS', ''),
    stake: orElse('HOUSE_STAKE', '0.005'),
    share: orElseNumber('HOUSE_SHARE', 35),
    mostPerAddress: orElseNumber('HOUSE_MOST_PER_ADDRESS', 3),
    waitBetween: orElseNumber('HOUSE_WAIT_BETWEEN_MS', 90_000),
    port: orElseNumber('HOUSE_PORT', 8787),
    lettingIn: orElse('HOUSE_LETTING_IN', 'http://localhost:5173')
  }
}
