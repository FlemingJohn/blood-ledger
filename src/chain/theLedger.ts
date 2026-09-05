import type { LedgerEntry } from '../types/ledger'
import type { Offer, Pact, SealingProgress, SealingStep, SealingWatcher } from '../types/pact'
import type { Raider, Standing, StandingGrade } from '../types/raider'

export const contractsAreLive = false

const gradeLadder: StandingGrade[] = ['F', 'D', 'C', 'B', 'B+', 'A']

const gradeFloors: { grade: StandingGrade; from: number }[] = [
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

const standInStanding: Standing = {
  score: 720,
  grade: 'B+',
  raids: 12,
  repaid: 9,
  lost: 3
}

const standInOffers: Offer[] = [
  {
    id: 'offer-beef',
    patronAddress: madeUpAddress('BEEF', 'CA12'),
    coinsStaked: 500,
    patronShare: 40,
    words: 'Bring me the Demonlord.',
    needsGrade: 'C',
    claimed: false
  },
  {
    id: 'offer-44ab',
    patronAddress: madeUpAddress('44AB', '9F'),
    coinsStaked: 120,
    patronShare: 25,
    words: 'Small stake. Come back and we will talk again.',
    needsGrade: 'F',
    claimed: false
  },
  {
    id: 'offer-d00d',
    patronAddress: madeUpAddress('D00D', '77'),
    coinsStaked: 2000,
    patronShare: 70,
    words: 'I do not fund the unproven.',
    needsGrade: 'A',
    claimed: false
  },
  {
    id: 'offer-7e11',
    patronAddress: madeUpAddress('7E11', '31'),
    coinsStaked: 800,
    patronShare: 50,
    words: 'Floor four or do not bother returning.',
    needsGrade: 'B',
    claimed: false
  },
  {
    id: 'offer-c0de',
    patronAddress: madeUpAddress('C0DE', 'AA'),
    coinsStaked: 300,
    patronShare: 35,
    words: 'Someone already took this one.',
    needsGrade: 'F',
    claimed: true
  }
]

const standInLedger: LedgerEntry[] = [
  {
    raiderAddress: madeUpAddress('91C2', '04'),
    outcome: 'fell',
    floorReached: 2,
    coinsCarried: 0,
    patronChange: -300,
    minutesAgo: 4
  },
  {
    raiderAddress: madeUpAddress('44AB', '09'),
    outcome: 'walked out',
    floorReached: 3,
    coinsCarried: 1850,
    patronChange: 420,
    minutesAgo: 11
  },
  {
    raiderAddress: madeUpAddress('7E11', '31'),
    outcome: 'fell',
    floorReached: 5,
    coinsCarried: 0,
    patronChange: -900,
    minutesAgo: 23
  },
  {
    raiderAddress: madeUpAddress('2F88', '12'),
    outcome: 'walked out',
    floorReached: 2,
    coinsCarried: 640,
    patronChange: 160,
    minutesAgo: 38
  }
]

export function readRaider(address: string): Raider {
  return {
    address,
    chosenClass: 'warrior',
    coins: 1240,
    standing: standInStanding
  }
}

export function readOffers(): Offer[] {
  return standInOffers.map((offer) => ({ ...offer }))
}

export function readLedger(): LedgerEntry[] {
  return standInLedger.map((entry) => ({ ...entry }))
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
