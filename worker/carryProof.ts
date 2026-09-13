import { Contract, JsonRpcProvider } from 'ethers'
import { chainInfo, proofProvider } from '@gluwa/usc-sdk'

const sealPactAction = 0
const gasBufferPercent = 135
const waitBetweenTries = 15_000
const giveUpAfter = 1_200_000

const executeShape =
  'execute(uint8,uint64,uint64,bytes,bytes32,tuple(bytes32,bool)[],bytes32,bytes32[])'

export interface CarryOrder {
  txHash: string
  sourceChainKey: number
  proofBuilderUrl: string
  creditcoin: JsonRpcProvider
  sourceChain: JsonRpcProvider
  ledger: Contract
  keeperAddress: string
}

export async function waitForProof(order: CarryOrder): Promise<proofProvider.ContinuityResponse> {
  const receipt = await order.sourceChain.waitForTransaction(order.txHash, 1, 120_000)
  if (!receipt || receipt.blockNumber === null) {
    throw new Error(`${order.txHash} is not mined on the source chain yet`)
  }

  const builder = new proofProvider.service.ProofBuilder(
    order.sourceChainKey,
    order.proofBuilderUrl
  )
  const info = new chainInfo.PrecompileChainInfoProvider(order.creditcoin)

  const latest = await info.getLatestAttestedHeightAndHash(order.sourceChainKey)
  console.log(
    `   witnesses have reached height ${latest.height}, this pact sits at ${receipt.blockNumber}`
  )

  await builder.waitUntilHeightAttested(
    order.sourceChainKey,
    receipt.blockNumber,
    waitBetweenTries,
    giveUpAfter
  )

  const answer = await builder.getProof(order.txHash)

  if (!answer.success || !answer.data) {
    throw new Error(answer.error ?? 'the proof builder gave nothing back')
  }

  return answer.data
}

export interface NotYet {
  waiting: true
  attestedHeight: number
  sitsAt: number
}

export async function proofIfReady(
  order: CarryOrder
): Promise<proofProvider.ContinuityResponse | NotYet> {
  const receipt = await order.sourceChain.getTransactionReceipt(order.txHash)

  if (!receipt || receipt.blockNumber === null) {
    return { waiting: true, attestedHeight: 0, sitsAt: 0 }
  }

  const info = new chainInfo.PrecompileChainInfoProvider(order.creditcoin)
  const latest = await info.getLatestAttestedHeightAndHash(order.sourceChainKey)

  const reached = Number(latest.height ?? 0)

  if (!latest.exists || reached < receipt.blockNumber) {
    return { waiting: true, attestedHeight: reached, sitsAt: receipt.blockNumber }
  }

  const builder = new proofProvider.service.ProofBuilder(
    order.sourceChainKey,
    order.proofBuilderUrl
  )

  const answer = await builder.getProof(order.txHash)

  if (!answer.success || !answer.data) {
    return { waiting: true, attestedHeight: reached, sitsAt: receipt.blockNumber }
  }

  return answer.data
}

export function stillWaiting(
  held: proofProvider.ContinuityResponse | NotYet
): held is NotYet {
  return (held as NotYet).waiting === true
}

function partsOf(proof: proofProvider.ContinuityResponse): unknown[] {
  return [
    sealPactAction,
    proof.chainKey,
    proof.headerNumber,
    proof.txBytes,
    proof.merkleProof.root,
    proof.merkleProof.siblings,
    proof.continuityProof.lowerEndpointDigest,
    proof.continuityProof.roots
  ]
}

async function roomToRun(order: CarryOrder, proof: proofProvider.ContinuityResponse): Promise<bigint> {
  const shape = order.ledger.interface.getFunction(executeShape)
  if (!shape) {
    throw new Error('the ledger has no execute of the shape Attestcoin calls')
  }

  const data = order.ledger.interface.encodeFunctionData(shape, partsOf(proof))
  const continuityBlocks = proof.continuityProof.roots?.length ?? 1

  try {
    const guessed = await order.creditcoin.estimateGas({
      to: await order.ledger.getAddress(),
      data,
      from: order.keeperAddress
    })
    return (guessed * BigInt(gasBufferPercent)) / 100n
  } catch {
    const roomForTheProof = 400_000 + continuityBlocks * 40_000
    return BigInt(Math.min(4_000_000, Math.max(900_000, roomForTheProof)))
  }
}

export async function carryToLedger(
  order: CarryOrder,
  proof: proofProvider.ContinuityResponse
): Promise<string> {
  const gasLimit = await roomToRun(order, proof)
  const parts = partsOf(proof)

  const sent = await order.ledger.getFunction(executeShape)(...parts, { gasLimit })
  const landed = await sent.wait()

  return landed?.hash ?? sent.hash
}
