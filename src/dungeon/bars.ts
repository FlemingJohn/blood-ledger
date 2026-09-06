import type { Fighter } from '../types/fighter'

const hale = '#5b9e68'
const wounded = '#c9a227'
const failing = '#8b0b2e'

export function lifeColour(share: number): string {
  if (share > 0.6) {
    return hale
  }
  if (share > 0.3) {
    return wounded
  }
  return failing
}

export function drawLifeBar(
  surface: CanvasRenderingContext2D,
  atX: number,
  atY: number,
  wide: number,
  tall: number,
  share: number
): void {
  const held = Math.max(0, Math.min(1, share))

  surface.fillStyle = 'rgba(4,0,2,.85)'
  surface.fillRect(atX - 1, atY - 1, wide + 2, tall + 2)

  surface.fillStyle = '#2c0d16'
  surface.fillRect(atX, atY, wide, tall)

  surface.fillStyle = lifeColour(held)
  surface.fillRect(atX, atY, wide * held, tall)
}

const barWidths: Record<string, number> = {
  skeleton: 44,
  slime: 36,
  demonlord: 90
}

export function barWidthFor(fighter: Fighter): number {
  return barWidths[fighter.kind] ?? 44
}
