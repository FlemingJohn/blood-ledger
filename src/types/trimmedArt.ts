export interface ContentBox {
  left: number
  top: number
  width: number
  height: number
}

export interface TrimmedGroup {
  frames: string[]
  content: ContentBox
  wholeFrame: { width: number; height: number }
}

export type TrimmedArt = Record<string, TrimmedGroup>
