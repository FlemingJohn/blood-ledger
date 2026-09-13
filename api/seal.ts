import { Contract, JsonRpcProvider, Wallet } from 'ethers'

import { letThemIn, type Asked, type Answered } from './_door.js'
import { carryToLedger, proofIfReady, stillWaiting } from '../worker/carryProof.js'

const howFarBack = 2000
const mostInOnePass = 3

const vaultShouts = [
  'event RaidFunded(address indexed raider, address indexed patron, uint256 pactId, uint256 coinsStaked, uint16 patronShare)'
]

const ledgerAnswers = [
  'function pacts(uint256) view returns (address raider, address patron, uint256 pactId, uint256 coinsStaked, uint16 patronShare, uint64 sealedAt, bool settled)',
  'function execute(uint8 action, uint64 chainKey, uint64 blockHeight, bytes encodedTransaction, bytes32 merkleRoot, tuple(bytes32 hash, bool isLeft)[] siblings, bytes32 lowerEndpointDigest, bytes32[] continuityRoots) returns (bool)'
]

function needed(name: string): string {
  const held = process.env[name]
  if (!held || held.trim().length === 0) {
    throw new Error(`${name} is not set`)
  }
  return held.trim()
}

export default async function door(ask: Asked, answer: Answered): Promise<void> {
  if (!letThemIn(ask, answer)) {
    return
  }

  try {
    const sourceChain = new JsonRpcProvider(needed('SOURCE_CHAIN_RPC_URL'))
    const creditcoin = new JsonRpcProvider(needed('CREDITCOIN_RPC_URL'))

    const carrier = new Wallet(needed('HOUSE_CREDITCOIN_KEY'), creditcoin)

    const vault = new Contract(needed('PATRON_VAULT_ADDRESS'), vaultShouts, sourceChain)
    const ledger = new Contract(needed('THE_LEDGER_ADDRESS'), ledgerAnswers, carrier)

    const sourceChainKey = Number(process.env.SOURCE_CHAIN_KEY ?? '1')
    const proofBuilderUrl = needed('PROOF_BUILDER_URL')

    const upTo = await sourceChain.getBlockNumber()
    const from = Math.max(0, upTo - howFarBack)

    const funded = await vault.queryFilter(vault.getEvent('RaidFunded')(), from, upTo)

    const sealed: unknown[] = []
    const waiting: unknown[] = []
    let tried = 0

    for (const one of funded) {
      if (tried >= mostInOnePass) {
        break
      }

      const said = vault.interface.parseLog({ topics: [...one.topics], data: one.data })
      const pactId = said?.args?.[2] as bigint
      const raider = String(said?.args?.[0] ?? '')

      const readPact = ledger.getFunction('pacts') as (
        id: bigint
      ) => Promise<{ raider: string }>

      const already = await readPact(pactId)

      if (already.raider !== '0x0000000000000000000000000000000000000000') {
        continue
      }

      tried += 1

      const order = {
        txHash: one.transactionHash,
        sourceChainKey,
        proofBuilderUrl,
        creditcoin,
        sourceChain,
        ledger,
        keeperAddress: carrier.address
      }

      try {
        const held = await proofIfReady(order)

        if (stillWaiting(held)) {
          waiting.push({
            pactId: Number(pactId),
            raider,
            txHash: one.transactionHash,
            sitsAt: held.sitsAt,
            attestedHeight: held.attestedHeight,
            blocksToGo: Math.max(0, held.sitsAt - held.attestedHeight)
          })
          continue
        }

        const landed = await carryToLedger(order, held)
        sealed.push({ pactId: Number(pactId), raider, txHash: landed })
      } catch (trouble) {
        waiting.push({
          pactId: Number(pactId),
          txHash: one.transactionHash,
          trouble: (trouble as Error).message.slice(0, 200)
        })
      }
    }

    answer.status(200).json({ carriedBy: carrier.address, sealed, waiting })
  } catch (trouble) {
    answer.status(500).json({ trouble: (trouble as Error).message })
  }
}
