import type { CoinPutUp, HowItStands, TheBoard } from '../types/board'
import type { Offer } from '../types/pact'
import { readTheLastStakes, theVaultIsDeployed } from './coinPutUp'
import { whatBecameOfThese } from './askTheLedger'

const mostWeShow = 25
const coinsPerEther = 100_000

export function coinsFromEther(amount: string): number {
  return Math.round(Number(amount) * coinsPerEther)
}

export async function readTheBoard(youAre: string): Promise<TheBoard | null> {
  if (!theVaultIsDeployed) {
    return null
  }

  const staked = await readTheLastStakes(mostWeShow)

  if (staked.length === 0) {
    return { inYourName: [], below: [] }
  }

  const fates = await whatBecameOfThese(staked.map((stake) => stake.pactId))

  const everything: CoinPutUp[] = staked.map((stake) => {
    const fate = fates.get(stake.pactId)

    let stands: HowItStands = 'waiting on the witnesses'

    if (stake.reclaimed) {
      stands = 'taken back'
    } else if (fate && fate.settled) {
      stands = 'over'
    } else if (fate && fate.sealed) {
      stands = 'open'
    }

    return {
      pactId: stake.pactId,
      patronAddress: stake.patronAddress,
      raiderAddress: stake.raiderAddress,
      coinsStaked: stake.coinsStaked,
      patronShare: stake.patronShare,
      stakedAt: stake.stakedAt,
      stands
    }
  })

  const yours = youAre.toLowerCase()

  const inYourName = everything.filter(
    (putUp) =>
      putUp.raiderAddress.toLowerCase() === yours &&
      (putUp.stands === 'open' || putUp.stands === 'waiting on the witnesses')
  )

  const taken = new Set(inYourName.map((putUp) => putUp.pactId))

  return {
    inYourName,
    below: everything.filter((putUp) => !taken.has(putUp.pactId))
  }
}

export function asAnOfferToYou(putUp: CoinPutUp): Offer {
  const waiting = putUp.stands === 'waiting on the witnesses'

  return {
    id: `pact-${putUp.pactId}`,
    patronAddress: putUp.patronAddress,
    patronName: null,
    coinsStaked: coinsFromEther(putUp.coinsStaked),
    patronShare: putUp.patronShare,
    words: waiting
      ? `${putUp.coinsStaked} ETH has left Ethereum for you. The witnesses are still agreeing.`
      : `${putUp.coinsStaked} ETH is staked in your name on Ethereum.`,
    needsGrade: 'F',
    claimed: false,
    reckoned: false
  }
}
