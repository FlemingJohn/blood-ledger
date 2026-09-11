import type { MarkName } from '../parts/marks'

export interface TourStep {
  at: string | HTMLElement
  mark: MarkName
  title: string
  said: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  before?(): void
}

export interface TourPart {
  walk(steps: TourStep[]): void
  stop(): void
  walking(): boolean
  whenDone(listener: () => void): void
  teardown(): void
}
