import type { BeenDown } from '../types/board'
import { readTheLastStakes, theVaultIsDeployed } from './coinPutUp'
import { openPactFromTheChain, standingFromTheChain } from './askTheLedger'

const mostWeLookAt = 25

function whatIsWorthSaying(who: BeenDown): string | null {
  if (!who.known) {
    return 'has never been down, so there is nothing to go on'
  }

  if (who.holdsAPact) {
    return 'already owes on a pact, and cannot take another until it settles'
  }

  if (who.standing.lost > who.standing.repaid) {
    return `has lost ${who.standing.lost} patrons and repaid ${who.standing.repaid}`
  }

  if (who.standing.raids > 0 && who.standing.repaid === 0) {
    return `has been down ${who.standing.raids} times and cleared nothing`
  }

  return null
}

export async function readWhoHasBeenDown(): Promise<BeenDown[]> {
  if (!theVaultIsDeployed) {
    return []
  }

  const staked = await readTheLastStakes(mostWeLookAt)

  if (staked.length === 0) {
    return []
  }

  const seen = new Map<string, string>()

  staked.forEach((stake) => {
    const key = stake.raiderAddress.toLowerCase()
    if (!seen.has(key)) {
      seen.set(key, stake.raiderAddress)
    }
  })

  const read = await Promise.all(
    Array.from(seen.values()).map(async (address) => {
      const [told, pact] = await Promise.all([
        standingFromTheChain(address),
        openPactFromTheChain(address)
      ])

      if (!told) {
        return null
      }

      const who: BeenDown = {
        address,
        standing: told.standing,
        known: told.known,
        holdsAPact: pact !== null && !pact.settled,
        note: null
      }

      who.note = whatIsWorthSaying(who)
      return who
    })
  )

  const everyone = read.filter((who): who is BeenDown => who !== null)

  everyone.sort((one, other) => other.standing.score - one.standing.score)

  return everyone
}
