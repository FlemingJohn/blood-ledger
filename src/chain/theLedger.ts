import type { Offer, Pact, SealingProgress, SealingStep, SealingWatcher } from '../types/pact'
import type { Raider, StandingGrade } from '../types/raider'
import type { Decision, RaiderFacts } from '../types/underwriting'
import { judge } from './underwriting'
import { classOf, coinsOf, standingOf } from './whatYouHaveDone'

export const contractsAreLive = true

const gradeLadder: StandingGrade[] = ['F', 'D', 'C', 'B', 'B+', 'A']

export const gradeFloors: { grade: StandingGrade; from: number }[] = [
  { grade: 'A', from: 900 },
  { grade: 'B+', from: 750 },
  { grade: 'B', from: 600 },
  { grade: 'C', from: 450 },
  { grade: 'D', from: 300 },
  { grade: 'F', from: 0 }
]

export function gradeFromScore(score: number): StandingGrade {
  const found = gradeFloors.find((step) => score >= step.from)
  return found ? found.grade : 'F'
}

export function gradeReaches(held: StandingGrade, needed: StandingGrade): boolean {
  return gradeLadder.indexOf(held) >= gradeLadder.indexOf(needed)
}

function madeUpAddress(head: string, tail: string): string {
  const middle = '0'.repeat(40 - head.length - tail.length)
  return `0x${head}${middle}${tail}`
}

export function readRaider(address: string): Raider {
  return {
    address,
    chosenClass: classOf(address),
    coins: coinsOf(address),
    standing: standingOf(address)
  }
}

export const underwriterAddress = madeUpAddress('01A1', 'AE')

export function factsAbout(raider: Raider): RaiderFacts {
  return {
    handle: 'this raider',
    standing: raider.standing.score,
    grade: raider.standing.grade,
    raids: raider.standing.raids,
    repaid: raider.standing.repaid,
    lost: raider.standing.lost,
    deepestFloor: 3,
    distinctPatrons: 4,
    timesFundedByUs: 0,
    fundedInACircle: false,
    youngestFunderAgeDays: 90
  }
}

export function readTheUnderwriter(raider: Raider): Decision {
  return judge(factsAbout(raider), { mostPerRaider: 900 })
}

function offerFromTheUnderwriter(raider: Raider): Offer | null {
  const decision = readTheUnderwriter(raider)

  if (decision.verdict === 'refuse') {
    return null
  }

  return {
    id: 'offer-underwriter',
    patronAddress: underwriterAddress,
    patronName: 'The Underwriter',
    coinsStaked: Math.round(Number(decision.coinsOffered)),
    patronShare: decision.patronShare,
    words: `Risk of default read at ${Math.round(decision.riskOfDefault * 100)} percent. The terms follow from that, and nothing else.`,
    needsGrade: 'F',
    claimed: false,
    reckoned: true
  }
}

export function readOffers(forRaider?: Raider): Offer[] {
  if (!forRaider) {
    return []
  }

  const reckoned = offerFromTheUnderwriter(forRaider)
  return reckoned ? [reckoned] : []
}

const everyStep: SealingStep[] = [
  'coin has left ethereum',
  'witnesses are agreeing',
  'carrying the proof',
  'forging your blade'
]

const rehearsalPacing = [1500, 2200, 1200, 2000]

function progressAt(reached: number): SealingProgress {
  return {
    steps: everyStep.map((step, place) => ({
      step,
      state: place < reached ? 'done' : place === reached ? 'working' : 'waiting'
    })),
    finished: reached >= everyStep.length,
    trouble: null
  }
}

export function sealPact(offer: Offer, watch: SealingWatcher): Promise<Pact> {
  return new Promise((settle) => {
    let reached = 0
    watch(progressAt(reached))

    function takeNextStep(): void {
      if (reached >= everyStep.length) {
        watch(progressAt(everyStep.length))
        settle({
          offerId: offer.id,
          patronAddress: offer.patronAddress,
          coinsStaked: offer.coinsStaked,
          patronShare: offer.patronShare,
          sealedAt: Date.now()
        })
        return
      }

      const pause = rehearsalPacing[reached] ?? 1500
      window.setTimeout(() => {
        reached += 1
        watch(progressAt(reached))
        takeNextStep()
      }, pause)
    }

    takeNextStep()
  })
}
