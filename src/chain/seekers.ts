import type { Raider } from '../types/raider'
import { gradeFromScore } from './theLedger'

export interface Seeker {
  raider: Raider
  note: string | null
}

function madeUpAddress(head: string, tail: string): string {
  const middle = '0'.repeat(40 - head.length - tail.length)
  return `0x${head}${middle}${tail}`
}

function standing(score: number, raids: number, repaid: number, lost: number) {
  return { score, grade: gradeFromScore(score), raids, repaid, lost }
}

const waiting: Seeker[] = [
  {
    raider: {
      address: madeUpAddress('7A3F', '9C2E'),
      chosenClass: 'warrior',
      coins: 1240,
      standing: standing(720, 12, 9, 3)
    },
    note: null
  },
  {
    raider: {
      address: madeUpAddress('44AB', '9F'),
      chosenClass: 'knight',
      coins: 380,
      standing: standing(640, 7, 5, 2)
    },
    note: null
  },
  {
    raider: {
      address: madeUpAddress('91C2', '04'),
      chosenClass: 'fighter',
      coins: 0,
      standing: standing(240, 4, 1, 3)
    },
    note: 'has lost three patrons and repaid one'
  },
  {
    raider: {
      address: madeUpAddress('C0DE', 'AA'),
      chosenClass: 'warrior',
      coins: 60,
      standing: standing(500, 6, 6, 0)
    },
    note: 'every pact came from one purse, and the coin went in a circle'
  },
  {
    raider: {
      address: madeUpAddress('2F88', '12'),
      chosenClass: 'fighter',
      coins: 0,
      standing: standing(500, 0, 0, 0)
    },
    note: 'has never been down'
  }
]

export function readSeekers(): Seeker[] {
  return waiting.map((one) => ({ raider: { ...one.raider }, note: one.note }))
}
