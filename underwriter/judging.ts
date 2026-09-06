import type { Decision, Flag, RaiderFacts } from './types'

const standingFloor = 300
const mostAPatronMayKeep = 80
const leastAPatronWillTake = 20

/**
 * Everything below is arithmetic on facts that arrived proved.
 *
 * No model is asked anything here. The same facts give the same verdict every
 * time, and each refusal names the reason it was refused, so a raider who is
 * turned down can be told exactly what to mend.
 */
export function judge(facts: RaiderFacts, purse: PurseLimits): Decision {
  const flags: Flag[] = []
  const reasons: string[] = []

  if (facts.raids === 0) {
    flags.push('no history at all')
    reasons.push('has never been down')
  }

  if (facts.raids > 0 && facts.repaid === 0) {
    flags.push('never repaid anyone')
    reasons.push(`has been down ${facts.raids} times and cleared nothing`)
  }

  if (facts.lost > facts.repaid) {
    flags.push('defaulted more than repaid')
    reasons.push(`has lost ${facts.lost} patrons and repaid ${facts.repaid}`)
  }

  if (facts.standing < standingFloor) {
    flags.push('standing below the floor')
    reasons.push(`standing is ${facts.standing}, below ${standingFloor}`)
  }

  if (facts.raids > 2 && facts.distinctPatrons === 1) {
    flags.push('funded only by one purse')
    reasons.push('every pact so far came from the same purse')
  }

  if (facts.youngestFunderAgeDays >= 0 && facts.youngestFunderAgeDays < 1) {
    flags.push('funders made the same day')
    reasons.push('was funded by a purse made the same day')
  }

  if (facts.fundedInACircle) {
    flags.push('money went in a circle')
    reasons.push('has funded one of their own patrons back')
  }

  if (facts.timesFundedByUs >= 5) {
    flags.push('pair already spent')
    reasons.push('we have backed them enough times that it earns them nothing')
  }

  const risk = riskOfDefault(facts, flags)
  const refusing = flags.some(refusalIsAutomatic) || risk > 0.62

  if (refusing) {
    return {
      verdict: 'refuse',
      patronShare: 0,
      coinsOffered: '0',
      riskOfDefault: round(risk),
      flags,
      reasons
    }
  }

  const share = shareThatPricesThis(risk)
  const coins = whatWeWillPutUp(risk, purse)

  reasons.push(`repaid ${facts.repaid} of ${facts.raids}, standing ${facts.standing}`)
  reasons.push(`reached floor ${facts.deepestFloor} at deepest`)

  return {
    verdict: 'fund',
    patronShare: share,
    coinsOffered: coins,
    riskOfDefault: round(risk),
    flags,
    reasons
  }
}

export interface PurseLimits {
  mostPerRaider: number
}

const automatic: Flag[] = [
  'never repaid anyone',
  'money went in a circle',
  'funders made the same day',
  'pair already spent'
]

function refusalIsAutomatic(flag: Flag): boolean {
  return automatic.includes(flag)
}

function riskOfDefault(facts: RaiderFacts, flags: Flag[]): number {
  if (facts.raids === 0) {
    return 0.5
  }

  const kept = facts.repaid / facts.raids
  const fromRecord = 1 - kept

  const fromStanding = 1 - Math.min(1, facts.standing / 1000)
  const fromDepth = facts.deepestFloor >= 3 ? -0.06 : 0.04
  const fromSpread = facts.distinctPatrons >= 3 ? -0.05 : 0.05
  const fromFlags = flags.length * 0.07

  const risk = fromRecord * 0.5 + fromStanding * 0.3 + fromDepth + fromSpread + fromFlags

  return Math.max(0.02, Math.min(0.98, risk))
}

function shareThatPricesThis(risk: number): number {
  const asked = Math.round(leastAPatronWillTake + risk * 70)
  return Math.max(leastAPatronWillTake, Math.min(mostAPatronMayKeep, asked))
}

function whatWeWillPutUp(risk: number, purse: PurseLimits): string {
  const trust = 1 - risk
  const offered = purse.mostPerRaider * trust
  return offered.toFixed(4)
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
