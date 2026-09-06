import type { PurseStanding } from './purse'
import type { RaiderClass } from './raider'
import type { Offer, OfferState, SealingProgress } from './pact'
import type { Profile } from './profile'

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

export interface PlinthPart extends Part {
  showClass(chosen: RaiderClass): void
  whenClassChanged(listener: (chosen: RaiderClass) => void): void
}

export interface OfferCardPart extends Part {
  offer: Offer
  showState(state: OfferState): void
  whenAccepted(listener: (offer: Offer) => void): void
}

export interface DescentPart extends Part {
  showBarred(barred: boolean): void
  whenPushed(listener: () => void): void
}

export interface SealingRitePart extends Part {
  showProgress(progress: SealingProgress): void
  open(): void
  close(): void
}

export interface ProfilePart extends Part {
  showProfile(profile: Profile): void
  closeProfile(): void
  whenClosed(listener: () => void): void
}
