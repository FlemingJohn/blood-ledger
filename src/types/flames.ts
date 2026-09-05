export interface BurningBackdrop {
  canvas: HTMLCanvasElement
  stop(): void
}

export interface ShaderPair {
  vertexSource: string
  fragmentSource: string
}
