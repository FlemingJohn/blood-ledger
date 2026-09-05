export interface FlipbookOrder {
  frames: string[]
  framesPerSecond: number
  startAtRandomFrame?: boolean
}

export interface RunningFlipbook {
  canvas: HTMLCanvasElement
  stop(): void
}
