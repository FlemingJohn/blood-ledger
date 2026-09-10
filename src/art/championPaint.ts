import type { RaiderClass } from '../types/raider'
import { champions, inkBands } from './champions'
import { championHeads } from './paths'


function bandFor(paint: CanvasRenderingContext2D, ink: keyof typeof inkBands): CanvasGradient {
  const [lit, deep] = inkBands[ink]
  const wash = paint.createLinearGradient(40, 20, 170, 300)
  wash.addColorStop(0, lit)
  wash.addColorStop(1, deep)
  return wash
}

const bustLeft = 38
const bustTop = 6
const bustWide = 124
const bustTall = 100

function paintFlatBust(who: RaiderClass, size: number): HTMLCanvasElement {
  const board = document.createElement('canvas')
  board.className = 'bust__face'
  board.setAttribute('role', 'img')
  board.setAttribute('aria-label', champions[who].said)

  const density = Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)))
  const wide = size * density

  board.width = wide
  board.height = wide
  board.style.width = `${size}px`
  board.style.height = `${size}px`

  const paint = board.getContext('2d')
  if (!paint) {
    return board
  }

  const scale = wide / bustWide
  const spare = (wide - bustTall * scale) / 2

  paint.setTransform(scale, 0, 0, scale, -bustLeft * scale, -bustTop * scale + spare)

  champions[who].parts.forEach((part) => {
    paint.fillStyle = bandFor(paint, part.fill)
    paint.fill(new Path2D(part.d))
  })

  return board
}

export function paintBust(who: RaiderClass, size: number): HTMLElement {
  const shot = document.createElement('img')

  shot.className = 'bust__face'
  shot.src = championHeads[who]
  shot.width = size
  shot.height = size
  shot.decoding = 'async'
  shot.setAttribute('role', 'img')
  shot.setAttribute('aria-label', champions[who].said)
  shot.style.width = `${size}px`
  shot.style.height = `${size}px`

  shot.addEventListener(
    'error',
    () => shot.replaceWith(paintFlatBust(who, size)),
    { once: true }
  )

  return shot
}
