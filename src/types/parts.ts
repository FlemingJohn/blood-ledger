import type { PurseStanding } from './purse'

export interface Part {
  element: HTMLElement
  teardown(): void
}

export interface DoorPart extends Part {
  showStanding(standing: PurseStanding): void
  whenPushed(listener: () => void): void
}

export interface ScrollPart extends Part {
  title: string
  isOpen(): boolean
  closeScroll(): void
}
