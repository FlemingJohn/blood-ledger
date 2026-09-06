export type PointerMood = 'resting' | 'enemy' | 'loot' | 'wayOut' | 'patron'

export interface PointerHand {
  wear(mood: PointerMood): void
  teardown(): void
}
