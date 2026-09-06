import type { PointerHand, PointerMood } from '../types/pointer'
import { gauntlets } from '../art/paths'
import { loadPicture } from '../art/pictures'
import { edgesAround } from '../art/trimming'

const biggestCursorBrowsersAllow = 88
const gripFromLeft = 7
const gripFromTop = 4

const cut = new Map<PointerMood, string>()

async function carveGauntlet(mood: PointerMood): Promise<string | null> {
  const already = cut.get(mood)
  if (already) {
    return already
  }

  try {
    const picture = await loadPicture(gauntlets[mood])
    const edges = edgesAround([picture], 8)
    if (!edges) {
      return null
    }

    const trimmedWidth = edges.right - edges.left + 1
    const trimmedHeight = edges.bottom - edges.top + 1
    const shrink = Math.min(1, biggestCursorBrowsersAllow / Math.max(trimmedWidth, trimmedHeight))

    const cutting = document.createElement('canvas')
    cutting.width = Math.max(1, Math.round(trimmedWidth * shrink))
    cutting.height = Math.max(1, Math.round(trimmedHeight * shrink))

    const surface = cutting.getContext('2d')
    if (!surface) {
      return null
    }

    surface.imageSmoothingEnabled = false
    surface.drawImage(
      picture,
      edges.left,
      edges.top,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      cutting.width,
      cutting.height
    )

    const carved = `url(${cutting.toDataURL('image/png')}) ${gripFromLeft} ${gripFromTop}, auto`
    cut.set(mood, carved)
    return carved
  } catch {
    return null
  }
}

export function armThePointer(): PointerHand {
  let wearing: PointerMood = 'resting'

  function show(mood: PointerMood): void {
    const carved = cut.get(mood)
    if (carved) {
      document.body.style.setProperty('--gauntlet', carved)
    }
  }

  void Promise.all(
    (['resting', 'enemy', 'loot', 'wayOut', 'patron'] as PointerMood[]).map(carveGauntlet)
  ).then(() => show(wearing))

  return {
    wear(mood: PointerMood): void {
      if (mood === wearing) {
        return
      }
      wearing = mood
      show(mood)
    },

    teardown(): void {
      document.body.style.removeProperty('--gauntlet')
    }
  }
}
