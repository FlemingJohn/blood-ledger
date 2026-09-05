export interface FlipbookOrder {
  frames: string[]
  framesPerSecond: number
  startAtRandomFrame?: boolean
  trimToContent?: boolean
  faintestKept?: number
}

export interface RunningFlipbook {
  canvas: HTMLCanvasElement
  stop(): void
}
