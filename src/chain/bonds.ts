const fullBond = 0.1

const ladder = [
  { from: 900, share: 0 },
  { from: 750, share: 10 },
  { from: 600, share: 30 },
  { from: 450, share: 60 },
  { from: 300, share: 80 },
  { from: 0, share: 100 }
]

export function bondShareFor(score: number): number {
  const step = ladder.find((rung) => score >= rung.from)
  return step ? step.share : 100
}

export function bondFor(score: number): number {
  return (fullBond * bondShareFor(score)) / 100
}

export function sayTheBond(score: number): string {
  return bondFor(score).toFixed(3)
}
