import type { GemGrade } from '../types/dungeon'

interface Grade {
  grade: GemGrade
  said: string
  worth: number
  rarity: number
  glow: string
}

export const gemGrades: Grade[] = [
  { grade: 'white', said: 'Common', worth: 120, rarity: 0.42, glow: '217,211,200' },
  { grade: 'green', said: 'Fine', worth: 180, rarity: 0.3, glow: '91,158,104' },
  { grade: 'blue', said: 'Rich', worth: 240, rarity: 0.2, glow: '74,127,193' },
  { grade: 'red', said: 'Rare', worth: 320, rarity: 0.08, glow: '214,21,78' }
]

export function gradeFromRoll(roll: number): Grade {
  let seen = 0

  for (const grade of gemGrades) {
    seen += grade.rarity
    if (roll <= seen) {
      return grade
    }
  }

  return gemGrades[0] as Grade
}

export function glowOf(grade: GemGrade | null): string {
  if (!grade) {
    return '201,162,39'
  }
  const found = gemGrades.find((one) => one.grade === grade)
  return found ? found.glow : '201,162,39'
}
