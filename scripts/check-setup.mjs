import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Contract, JsonRpcProvider, Wallet, formatEther } from 'ethers'
import { chainInfo } from '@gluwa/usc-sdk'
import { config } from 'dotenv'

config()

const here = dirname(fileURLToPath(import.meta.url))
const outFolder = resolve(here, '..', 'contracts', 'out')

let good = 0
let bad = 0

function ok(what, said) {
  good += 1
  console.log(`  ok    ${what.padEnd(40)} ${said ?? ''}`)
}

function no(what, said) {
  bad += 1
  console.log(`  MISS  ${what.padEnd(40)} ${said ?? ''}`)
}

function held(name) {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value.trim() : null
}

function looksLikeAddress(value) {
  return typeof value === 'string' && /^0x[0-9a-fA-F]{40}$/.test(value)
}

function looksLikeKey(value) {
  return typeof value === 'string' && /^0x[0-9a-fA-F]{64}$/.test(value)
}

console.log('\nBlood Ledger setup check\n')
console.log('the .env file')

for (const name of [
  'SOURCE_CHAIN_RPC_URL',
  'SOURCE_CHAIN_KEY',
  'CREDITCOIN_RPC_URL',
  'PROOF_BUILDER_URL'
]) {
  const value = held(name)
  if (value) {
    ok(name, value)
  } else {
    no(name, 'not set')
  }
}

for (const name of ['SEPOLIA_WALLET_PRIVATE_KEY', 'CREDITCOIN_WALLET_PRIVATE_KEY']) {
  const value = held(name)
  if (!value) {
    no(name, 'not set')
  } else if (!looksLikeKey(value)) {
    no(name, 'should be 0x then 64 hex characters')
  } else {
    ok(name, `set, ends ${value.slice(-6)}`)
  }
}

for (const name of ['PATRON_VAULT_ADDRESS', 'THE_LEDGER_ADDRESS']) {
  const value = held(name)
  if (!value || value === '0x') {
    no(name, 'not deployed yet')
  } else if (!looksLikeAddress(value)) {
    no(name, 'does not look like an address')
  } else {
    ok(name, value)
  }
}

console.log('\nthe contracts are built')

for (const name of ['PatronVault', 'TheLedger']) {
  try {
    const built = JSON.parse(await readFile(join(outFolder, `${name}.json`), 'utf8'))
    ok(name, `${built.deployedSize} bytes`)
  } catch {
    no(name, 'run: npm run build-contracts')
  }
}

console.log('\nthe chains answer')

async function reach(what, url, wantChainId) {
  if (!url) {
    no(what, 'no rpc set')
    return null
  }
  try {
    const provider = new JsonRpcProvider(url)
    const network = await provider.getNetwork()
    const block = await provider.getBlockNumber()

    if (wantChainId && Number(network.chainId) !== wantChainId) {
      no(what, `chainId ${network.chainId}, expected ${wantChainId}`)
      return provider
    }

    ok(what, `chainId ${network.chainId}, block ${block}`)
    return provider
  } catch (trouble) {
    no(what, trouble.message.slice(0, 60))
    return null
  }
}

const sepolia = await reach('sepolia', held('SOURCE_CHAIN_RPC_URL'), 11155111)
const creditcoin = await reach('creditcoin', held('CREDITCOIN_RPC_URL'), 102031)

console.log('\nyour purses have coin')

async function purse(what, provider, key, symbol) {
  if (!provider || !looksLikeKey(key)) {
    no(what, 'skipped')
    return
  }
  try {
    const wallet = new Wallet(key, provider)
    const balance = await provider.getBalance(wallet.address)
    const said = `${wallet.address} holds ${formatEther(balance)} ${symbol}`

    if (balance === 0n) {
      no(what, said)
      return
    }
    ok(what, said)
  } catch (trouble) {
    no(what, trouble.message.slice(0, 60))
  }
}

await purse('sepolia purse', sepolia, held('SEPOLIA_WALLET_PRIVATE_KEY'), 'ETH')
await purse('creditcoin purse', creditcoin, held('CREDITCOIN_WALLET_PRIVATE_KEY'), 'tCTC')

console.log('\nattestcoin is awake')

if (creditcoin) {
  try {
    const info = new chainInfo.PrecompileChainInfoProvider(creditcoin)
    const chainKey = Number(held('SOURCE_CHAIN_KEY') ?? 1)
    const latest = await info.getLatestAttestedHeightAndHash(chainKey)

    if (latest.exists) {
      ok(`chain key ${chainKey} is attested`, `height ${latest.height}`)
    } else {
      no(`chain key ${chainKey} is attested`, 'no attestation found')
    }
  } catch (trouble) {
    no('the chain info precompile', trouble.message.slice(0, 60))
  }
}

const builderUrl = held('PROOF_BUILDER_URL')
if (builderUrl) {
  try {
    const answer = await fetch(builderUrl)
    if (answer.status < 500) {
      ok('the proof builder answers', `${answer.status}`)
    } else {
      no('the proof builder answers', `${answer.status}`)
    }
  } catch (trouble) {
    no('the proof builder answers', trouble.message.slice(0, 60))
  }
}

console.log('\nthe ledger knows its vault')

const ledgerAt = held('THE_LEDGER_ADDRESS')
const vaultAt = held('PATRON_VAULT_ADDRESS')

if (creditcoin && looksLikeAddress(ledgerAt)) {
  try {
    const built = JSON.parse(await readFile(join(outFolder, 'TheLedger.json'), 'utf8'))
    const ledger = new Contract(ledgerAt, built.abi, creditcoin)
    const named = await ledger.patronVault()

    if (named === '0x0000000000000000000000000000000000000000') {
      no('nameTheVault has been called', 'run: npm run name-vault')
    } else if (looksLikeAddress(vaultAt) && named.toLowerCase() !== vaultAt.toLowerCase()) {
      no('the ledger believes your vault', `it believes ${named}`)
    } else {
      ok('the ledger believes your vault', named)
    }
  } catch (trouble) {
    no('reading the ledger', trouble.message.slice(0, 60))
  }
} else {
  no('the ledger is deployed', 'not yet')
}

console.log('')
console.log(`${good} ready, ${bad} still to do`)

if (bad > 0) {
  console.log('\nSee DEPLOYING.md for what each step needs.')
  process.exit(1)
}

console.log('\nEverything is ready. Run: npm run worker')
