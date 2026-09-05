import type { Facing } from '../types/dungeon'

const roundTheCompass: Facing[] = ['E', 'NE', 'N', 'NW', 'W', 'SW', 'S', 'SE']

const stepIsDegrees = 45

export function facingFrom(alongX: number, alongY: number): Facing {
  if (alongX === 0 && alongY === 0) {
    return 'S'
  }

  const yaw = (Math.atan2(-alongY, alongX) * 180) / Math.PI
  const wrapped = (yaw + 360) % 360
  const step = Math.round(wrapped / stepIsDegrees) % roundTheCompass.length

  return roundTheCompass[step] ?? 'S'
}

export function stepsApart(here: Facing, there: Facing): number {
  const from = roundTheCompass.indexOf(here)
  const to = roundTheCompass.indexOf(there)
  if (from < 0 || to < 0) {
    return 0
  }
  const raw = Math.abs(from - to)
  return Math.min(raw, roundTheCompass.length - raw)
}
