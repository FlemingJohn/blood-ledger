import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers'
import { config } from 'dotenv'

config()

const scriptFolder = dirname(fileURLToPath(import.meta.url))
const outFolder = resolve(scriptFolder, '..', 'contracts', 'out')

async function built(name) {
  return JSON.parse(await readFile(join(outFolder, `${name}.json`), 'utf8'))
}

function needed(name) {
  const held = process.env[name]
  if (!held || held.trim().length === 0) {
    console.error(`${name} is not set. Copy worker/.env.example to .env and fill it in.`)
    process.exit(1)
  }
  return held.trim()
}

const which = process.argv[2]

if (which !== 'vault' && which !== 'ledger' && which !== 'name-vault') {
  console.error('Usage: node scripts/deploy-contracts.mjs vault | ledger | name-vault')
  process.exit(1)
}

if (which === 'vault') {
  const provider = new JsonRpcProvider(needed('SOURCE_CHAIN_RPC_URL'))
  const wallet = new Wallet(needed('SEPOLIA_WALLET_PRIVATE_KEY'), provider)
  const artefact = await built('PatronVault')

  console.log(`deploying PatronVault from ${wallet.address}`)

  const factory = new ContractFactory(artefact.abi, artefact.bytecode, wallet)
  const contract = await factory.deploy()
  await contract.waitForDeployment()

  const at = await contract.getAddress()
  console.log(`PatronVault is at ${at}`)
  console.log(`put PATRON_VAULT_ADDRESS=${at} in your .env`)
}

if (which === 'ledger') {
  const provider = new JsonRpcProvider(needed('CREDITCOIN_RPC_URL'))
  const wallet = new Wallet(needed('CREDITCOIN_WALLET_PRIVATE_KEY'), provider)
  const artefact = await built('TheLedger')

  console.log(`deploying TheLedger from ${wallet.address}`)

  const factory = new ContractFactory(artefact.abi, artefact.bytecode, wallet)
  const contract = await factory.deploy(wallet.address)
  await contract.waitForDeployment()

  const at = await contract.getAddress()
  console.log(`TheLedger is at ${at}`)
  console.log(`put THE_LEDGER_ADDRESS=${at} in your .env, then run: name-vault`)
}

if (which === 'name-vault') {
  const provider = new JsonRpcProvider(needed('CREDITCOIN_RPC_URL'))
  const wallet = new Wallet(needed('CREDITCOIN_WALLET_PRIVATE_KEY'), provider)
  const artefact = await built('TheLedger')

  const { Contract } = await import('ethers')
  const ledger = new Contract(needed('THE_LEDGER_ADDRESS'), artefact.abi, wallet)

  const vault = needed('PATRON_VAULT_ADDRESS')
  const chainKey = Number(needed('SOURCE_CHAIN_KEY'))

  console.log(`telling the ledger to believe ${vault} on chain key ${chainKey}`)

  const sent = await ledger.nameTheVault(vault, chainKey)
  await sent.wait()

  console.log(`done at ${sent.hash}`)
}
