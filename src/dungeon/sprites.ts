import type { TrimmedArt, TrimmedGroup } from '../types/trimmedArt'
import { loadEveryPicture, loadPicture } from '../art/pictures'

const manifestPath = '/art/trimmed/manifest.json'

export interface DrawnGroup {
  pictures: HTMLImageElement[]
  group: TrimmedGroup
}

export interface SpriteStore {
  group(name: string): DrawnGroup | null
  bring(names: string[]): Promise<void>
}

export async function openSpriteStore(): Promise<SpriteStore> {
  const answer = await fetch(manifestPath)
  if (!answer.ok) {
    throw new Error('the trimmed art manifest is missing. run: npm run trim-art')
  }

  const manifest = (await answer.json()) as TrimmedArt
  const ready = new Map<string, DrawnGroup>()

  return {
    group(name: string): DrawnGroup | null {
      return ready.get(name) ?? null
    },

    async bring(names: string[]): Promise<void> {
      await Promise.all(
        names.map(async (name) => {
          if (ready.has(name)) {
            return
          }
          const group = manifest[name]
          if (!group) {
            return
          }
          const pictures = await loadEveryPicture(group.frames)
          ready.set(name, { pictures, group })
        })
      )
    }
  }
}

export function drawFromGroup(
  surface: CanvasRenderingContext2D,
  drawn: DrawnGroup,
  frame: number,
  atX: number,
  atY: number,
  magnify: number
): void {
  const picture = drawn.pictures[frame % drawn.pictures.length]
  if (!picture) {
    return
  }

  const { content, wholeFrame } = drawn.group

  const fromFrameLeft = content.left - wholeFrame.width / 2
  const fromFrameTop = content.top - wholeFrame.height / 2

  surface.drawImage(
    picture,
    Math.round(atX + fromFrameLeft * magnify),
    Math.round(atY + fromFrameTop * magnify),
    Math.round(content.width * magnify),
    Math.round(content.height * magnify)
  )
}

export async function loadGroundTiles(): Promise<{
  floor: HTMLImageElement
  dark: HTMLImageElement
}> {
  const [floor, dark] = await Promise.all([
    loadPicture('/art/dungeon/ground/floor.png'),
    loadPicture('/art/dungeon/ground/dark.png')
  ])
  return { floor, dark }
}
