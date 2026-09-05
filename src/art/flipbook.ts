import type { FlipbookOrder, RunningFlipbook } from '../types/flipbook'
import type { Edges } from '../types/trimming'
import { loadEveryPicture } from './pictures'
import { edgesAround } from './trimming'

const stillnessAsked = window.matchMedia('(prefers-reduced-motion: reduce)')

export async function startFlipbook(order: FlipbookOrder): Promise<RunningFlipbook> {
  const pictures = await loadEveryPicture(order.frames)
  const first = pictures[0]
  if (!first) {
    throw new Error('a flipbook needs at least one frame')
  }

  const wholeFrame: Edges = {
    left: 0,
    top: 0,
    right: first.naturalWidth - 1,
    bottom: first.naturalHeight - 1
  }

  const edges = order.trimToContent
    ? edgesAround(pictures, order.faintestKept ?? 24) ?? wholeFrame
    : wholeFrame

  const takeWidth = edges.right - edges.left + 1
  const takeHeight = edges.bottom - edges.top + 1

  const magnify = Math.max(1, Math.round(order.magnify ?? 1))
  const drawWidth = takeWidth * magnify
  const drawHeight = takeHeight * magnify

  const canvas = document.createElement('canvas')
  canvas.width = drawWidth
  canvas.height = drawHeight

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
    surface.clearRect(0, 0, drawWidth, drawHeight)
    surface.imageSmoothingEnabled = false
    surface.drawImage(
      picture,
      edges.left,
      edges.top,
      takeWidth,
      takeHeight,
      0,
      0,
      drawWidth,
      drawHeight
    )
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
