import type { StandingGrade } from '../types/raider'

const titles: Record<StandingGrade, string> = {
  F: 'The Unproven',
  D: 'The Debtor',
  C: 'The Steady',
  B: 'The Trusted',
  'B+': 'The Proven',
  A: 'The Named'
}

export function titleFor(grade: StandingGrade): string {
  return titles[grade]
}
