import type { Edges } from '../types/trimming'

export function edgesAround(pictures: HTMLImageElement[], faintestKept: number): Edges | null {
  let left = Number.POSITIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let right = -1
  let bottom = -1

  pictures.forEach((picture) => {
    const width = picture.naturalWidth
    const height = picture.naturalHeight
    if (width === 0 || height === 0) {
      return
    }

    const scratch = document.createElement('canvas')
    scratch.width = width
    scratch.height = height

    const surface = scratch.getContext('2d', { willReadFrequently: true })
    if (!surface) {
      return
    }

    surface.drawImage(picture, 0, 0)
    const pixels = surface.getImageData(0, 0, width, height).data

    for (let row = 0; row < height; row += 1) {
      for (let column = 0; column < width; column += 1) {
        const seeThrough = pixels[(row * width + column) * 4 + 3] ?? 0
        if (seeThrough > faintestKept) {
          if (column < left) left = column
          if (column > right) right = column
          if (row < top) top = row
          if (row > bottom) bottom = row
        }
      }
    }
  })

  if (right < left || bottom < top) {
    return null
  }

  return { left, top, right, bottom }
}
