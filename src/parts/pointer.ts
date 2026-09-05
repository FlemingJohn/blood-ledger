import { gauntletPointer } from '../art/paths'
import { loadPicture } from '../art/pictures'

const biggestCursorBrowsersAllow = 88
const gripFromLeft = 7
const gripFromTop = 4

interface Edges {
  left: number
  top: number
  right: number
  bottom: number
}

function findEdges(pixels: Uint8ClampedArray, width: number, height: number): Edges | null {
  let left = width
  let top = height
  let right = -1
  let bottom = -1

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const seeThrough = pixels[(row * width + column) * 4 + 3] ?? 0
      if (seeThrough > 8) {
        if (column < left) left = column
        if (column > right) right = column
        if (row < top) top = row
        if (row > bottom) bottom = row
      }
    }
  }

  return right < left || bottom < top ? null : { left, top, right, bottom }
}

export async function armThePointer(): Promise<void> {
  try {
    const picture = await loadPicture(gauntletPointer)

    const reading = document.createElement('canvas')
    reading.width = picture.naturalWidth
    reading.height = picture.naturalHeight
    const readingSurface = reading.getContext('2d', { willReadFrequently: true })
    if (!readingSurface) {
      return
    }
    readingSurface.drawImage(picture, 0, 0)

    const edges = findEdges(
      readingSurface.getImageData(0, 0, reading.width, reading.height).data,
      reading.width,
      reading.height
    )
    if (!edges) {
      return
    }

    const trimmedWidth = edges.right - edges.left + 1
    const trimmedHeight = edges.bottom - edges.top + 1
    const shrink = Math.min(1, biggestCursorBrowsersAllow / Math.max(trimmedWidth, trimmedHeight))

    const cutting = document.createElement('canvas')
    cutting.width = Math.max(1, Math.round(trimmedWidth * shrink))
    cutting.height = Math.max(1, Math.round(trimmedHeight * shrink))
    const cuttingSurface = cutting.getContext('2d')
    if (!cuttingSurface) {
      return
    }
    cuttingSurface.imageSmoothingEnabled = false
    cuttingSurface.drawImage(
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
