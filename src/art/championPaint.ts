import type { RaiderClass } from '../types/raider'
import { champions, inkBands } from './champions'

const frameWide = 200
const frameTall = 320
const rimReach = 3

function bandFor(paint: CanvasRenderingContext2D, ink: keyof typeof inkBands): CanvasGradient {
  const [lit, deep] = inkBands[ink]
  const wash = paint.createLinearGradient(40, 20, 170, 300)
  wash.addColorStop(0, lit)
  wash.addColorStop(1, deep)
  return wash
}

function layTheFigure(paint: CanvasRenderingContext2D, who: RaiderClass, solid: string | null): void {
  champions[who].parts.forEach((part) => {
    const shape = new Path2D(part.d)
    paint.fillStyle = solid ?? bandFor(paint, part.fill)
    paint.fill(shape)
  })
}

function castTheShadow(paint: CanvasRenderingContext2D): void {
  const pool = paint.createRadialGradient(100, 302, 2, 100, 302, 58)
  pool.addColorStop(0, 'rgba(4, 0, 2, 0.85)')
  pool.addColorStop(1, 'rgba(4, 0, 2, 0)')

  paint.fillStyle = pool
  paint.beginPath()
  paint.ellipse(100, 302, 58, 13, 0, 0, Math.PI * 2)
  paint.fill()
}

function carveTheRim(who: RaiderClass, wide: number, tall: number, step: number): HTMLCanvasElement {
  const cut = document.createElement('canvas')
  cut.width = wide
  cut.height = tall

  const paint = cut.getContext('2d')
  if (!paint) {
    return cut
  }

  paint.setTransform(wide / frameWide, 0, 0, tall / frameTall, 0, 0)
  layTheFigure(paint, who, '#ffffff')

  paint.setTransform(1, 0, 0, 1, 0, 0)
  paint.globalCompositeOperation = 'destination-out'
  paint.drawImage(cut, step, 0)

  return cut
}

function lightFromTheAlcove(paint: CanvasRenderingContext2D, who: RaiderClass, wide: number, tall: number): void {
  const reach = Math.max(1, Math.round((rimReach * wide) / frameWide))

  const leftSide = carveTheRim(who, wide, tall, reach)
  const rightSide = carveTheRim(who, wide, tall, -reach)

  paint.save()
  paint.setTransform(1, 0, 0, 1, 0, 0)
  paint.globalCompositeOperation = 'lighter'
  paint.globalAlpha = 0.5
  paint.drawImage(leftSide, 0, 0)
  paint.drawImage(rightSide, 0, 0)

  paint.globalCompositeOperation = 'source-atop'
  paint.globalAlpha = 0.42

  const warmth = paint.createLinearGradient(0, 0, wide, 0)
  warmth.addColorStop(0, '#ff8a2b')
  warmth.addColorStop(0.5, 'rgba(255, 138, 43, 0)')
  warmth.addColorStop(1, '#ff8a2b')

  paint.fillStyle = warmth
  paint.fillRect(0, 0, wide, tall)
  paint.restore()
}

export function paintChampion(who: RaiderClass, tall: number): HTMLCanvasElement {
  const board = document.createElement('canvas')
  board.className = 'champion'
  board.setAttribute('role', 'img')
  board.setAttribute('aria-label', champions[who].said)

  const shownWide = Math.round((tall * frameWide) / frameTall)
  const density = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)))
  const wide = shownWide * density
  const high = tall * density

  board.width = wide
  board.height = high
  board.style.width = `${shownWide}px`
  board.style.height = `${tall}px`

  const paint = board.getContext('2d')
  if (!paint) {
    return board
  }

  paint.setTransform(wide / frameWide, 0, 0, high / frameTall, 0, 0)
  castTheShadow(paint)
  layTheFigure(paint, who, null)
  lightFromTheAlcove(paint, who, wide, high)

  return board
}
