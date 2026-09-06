import { JsonRpcProvider } from 'ethers'
import { blockProver, chainInfo } from '@gluwa/usc-sdk'

const creditcoinRpc = 'https://rpc.cc3-testnet.creditcoin.network'
const proofBuilder = 'https://prover.cc3-testnet.creditcoin.network'
const sepoliaKey = 1

let checks = 0
let failures = 0

function is(what, ok, said) {
  checks += 1
  if (!ok) {
    failures += 1
    console.log(`  FAIL ${what}${said ? `: ${said}` : ''}`)
    return
  }
  console.log(`  ok   ${what.padEnd(38)} ${said ?? ''}`)
}

console.log('reaching the live Attestcoin testnet\n')

try {
  const creditcoin = new JsonRpcProvider(creditcoinRpc)

  const network = await creditcoin.getNetwork()
  is('creditcoin answers', Number(network.chainId) === 102031, `chainId ${network.chainId}`)

  const block = await creditcoin.getBlockNumber()
  is('creditcoin is making blocks', block > 0, `block ${block}`)

  is(
    'the block prover sits where the docs say',
    blockProver.BLOCK_PROVER_PRECOMPILE_ADDRESS.toLowerCase() ===
      '0x0000000000000000000000000000000000000fd2',
    blockProver.BLOCK_PROVER_PRECOMPILE_ADDRESS
  )

  const info = new chainInfo.PrecompileChainInfoProvider(creditcoin)

  const chains = await info.getSupportedChains()
  is('attestcoin names its source chains', chains.length > 0, `${chains.length} chains`)

  const latest = await info.getLatestAttestedHeightAndHash(sepoliaKey)
  is('sepolia is attested', latest.exists === true, `height ${latest.height}`)
  is('the digest is a full word', /^0x[0-9a-fA-F]{64}$/.test(latest.hash), latest.hash.slice(0, 18) + '…')
  is('the digest is an attestation', latest.isAttestation === true)

  const back = await info.getAttestationHeightForDigest(sepoliaKey, latest.hash)
  is(
    'the digest maps back to its height',
    Number(back.height) === Number(latest.height),
    `${back.height}`
  )

  const answer = await fetch(proofBuilder)
  is('the proof builder answers', answer.status < 500, `${answer.status}`)
} catch (trouble) {
  failures += 1
  console.log(`  FAIL could not reach the testnet: ${trouble.message}`)
}

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)

if (failures > 0) {
  process.exit(1)
}
