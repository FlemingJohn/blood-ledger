import type { FlipbookOrder, RunningFlipbook } from '../types/flipbook'
import { loadEveryPicture } from './pictures'

const stillnessAsked = window.matchMedia('(prefers-reduced-motion: reduce)')

export async function startFlipbook(order: FlipbookOrder): Promise<RunningFlipbook> {
  const pictures = await loadEveryPicture(order.frames)
  const first = pictures[0]
  if (!first) {
    throw new Error('a flipbook needs at least one frame')
  }

  const canvas = document.createElement('canvas')
  canvas.width = first.naturalWidth
  canvas.height = first.naturalHeight

  const surface = canvas.getContext('2d')
  if (!surface) {
    throw new Error('this browser will not give us a drawing surface')
  }
  surface.imageSmoothingEnabled = false

  let showing = order.startAtRandomFrame ? Math.floor(Math.random() * pictures.length) : 0
  let lastPaintedAt = 0
  let owed = 0
  let stillRunning = true
  let heartbeat = 0

  const secondsPerFrame = 1000 / order.framesPerSecond

  function paint(which: number): void {
    const picture = pictures[which]
    if (!picture || !surface) {
      return
    }
    surface.clearRect(0, 0, canvas.width, canvas.height)
    surface.drawImage(picture, 0, 0)
  }

  function beat(now: number): void {
    if (!stillRunning) {
      return
    }
    if (lastPaintedAt === 0) {
      lastPaintedAt = now
    }
    owed += now - lastPaintedAt
    lastPaintedAt = now

    while (owed >= secondsPerFrame) {
      owed -= secondsPerFrame
      showing = (showing + 1) % pictures.length
      paint(showing)
    }

    heartbeat = window.requestAnimationFrame(beat)
  }

  paint(showing)

  if (!stillnessAsked.matches) {
    heartbeat = window.requestAnimationFrame(beat)
  }

  return {
    canvas,
    stop(): void {
      stillRunning = false
      if (heartbeat) {
        window.cancelAnimationFrame(heartbeat)
      }
    }
  }
}
