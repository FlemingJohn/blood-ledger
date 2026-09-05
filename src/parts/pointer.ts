import { gauntletPointer } from '../art/paths'
import { loadPicture } from '../art/pictures'
import { edgesAround } from '../art/trimming'

const biggestCursorBrowsersAllow = 88
const gripFromLeft = 7
const gripFromTop = 4

export async function armThePointer(): Promise<void> {
  try {
    const picture = await loadPicture(gauntletPointer)
    const edges = edgesAround([picture], 8)
    if (!edges) {
      return
    }

    const trimmedWidth = edges.right - edges.left + 1
    const trimmedHeight = edges.bottom - edges.top + 1
    const shrink = Math.min(1, biggestCursorBrowsersAllow / Math.max(trimmedWidth, trimmedHeight))

    const cutting = document.createElement('canvas')
    cutting.width = Math.max(1, Math.round(trimmedWidth * shrink))
    cutting.height = Math.max(1, Math.round(trimmedHeight * shrink))

    const surface = cutting.getContext('2d')
    if (!surface) {
      return
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

    document.body.style.cursor = `url(${cutting.toDataURL('image/png')}) ${gripFromLeft} ${gripFromTop}, auto`
  } catch {
    document.body.style.cursor = 'auto'
  }
}
