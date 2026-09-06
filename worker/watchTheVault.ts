import { Contract, JsonRpcProvider, Wallet } from 'ethers'

import { readSettings } from './settings'
import { carryToLedger, waitForProof } from './carryProof'
import patronVaultBuilt from '../contracts/out/PatronVault.json' with { type: 'json' }
import theLedgerBuilt from '../contracts/out/TheLedger.json' with { type: 'json' }

let stopping = false

process.on('SIGINT', () => {
  console.log('\nputting the tools down')
  stopping = true
})
process.on('SIGTERM', () => {
  stopping = true
})

function sleep(forMs: number): Promise<void> {
  return new Promise((wake) => setTimeout(wake, forMs))
}

async function main(): Promise<void> {
  const settings = readSettings()

  const sourceChain = new JsonRpcProvider(settings.sourceChainRpc)
  const creditcoin = new JsonRpcProvider(settings.creditcoinRpc)
  const keeper = new Wallet(settings.keeperKey, creditcoin)

  const vault = new Contract(settings.patronVault, patronVaultBuilt.abi, sourceChain)
  const ledger = new Contract(settings.theLedger, theLedgerBuilt.abi, keeper)

  const namedVault: string = await ledger.patronVault()
  if (namedVault.toLowerCase() !== settings.patronVault.toLowerCase()) {
    throw new Error(
      `the ledger believes ${namedVault}, not ${settings.patronVault}. Call nameTheVault first.`
    )
  }

  let readFrom = (await sourceChain.getBlockNumber()) - settings.lookBackBlocks
  const carried = new Set<string>()

  console.log('Blood Ledger worker')
  console.log(`  vault   ${settings.patronVault} on chain key ${settings.sourceChainKey}`)
  console.log(`  ledger  ${settings.theLedger}`)
  console.log(`  keeper  ${keeper.address}`)
  console.log(`  reading the vault from block ${readFrom}`)
  console.log('')

  while (!stopping) {
    try {
      const upTo = await sourceChain.getBlockNumber()

      if (upTo >= readFrom) {
        const funded = await vault.queryFilter(vault.filters.RaidFunded(), readFrom, upTo)

        for (const one of funded) {
          if (stopping || carried.has(one.transactionHash)) {
            continue
          }
          carried.add(one.transactionHash)

          const said = vault.interface.parseLog({ topics: [...one.topics], data: one.data })
          const raider = said?.args?.[0] as string
          const staked = said?.args?.[3] as bigint

          console.log(`a patron staked ${staked} for ${raider}`)
          console.log(`   at ${one.transactionHash}`)

          try {
            const proof = await waitForProof({
              txHash: one.transactionHash,
              sourceChainKey: settings.sourceChainKey,
              proofBuilderUrl: settings.proofBuilderUrl,
              creditcoin,
              sourceChain,
              ledger,
              keeperAddress: keeper.address
            })

            console.log('   proof built, carrying it to Creditcoin')

            const landed = await carryToLedger(
              {
                txHash: one.transactionHash,
                sourceChainKey: settings.sourceChainKey,
                proofBuilderUrl: settings.proofBuilderUrl,
                creditcoin,
                sourceChain,
                ledger,
                keeperAddress: keeper.address
              },
              proof
            )

            console.log(`   pact sealed at ${landed}`)
          } catch (trouble) {
            carried.delete(one.transactionHash)
            console.error(`   could not seal it: ${(trouble as Error).message}`)
          }

          console.log('')
        }

        readFrom = upTo + 1
      }
    } catch (trouble) {
      console.error(`reading the vault failed: ${(trouble as Error).message}`)
    }

    await sleep(settings.pollEvery)
  }

  console.log('worker stopped')
}

main().catch((trouble) => {
  console.error(trouble)
  process.exit(1)
})
