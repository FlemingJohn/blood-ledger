import type { Offer } from '../types/pact'
import type { OfferCardPart, Part } from '../types/parts'
import type { StandingGrade } from '../types/raider'
import { gradeReaches } from '../chain/theLedger'
import { layOutOffer } from './offerCard'
import { drawTorchBracket } from './hallMarks'

const richEnoughToGlint = 1000

export interface BoardOrder {
  offers: Offer[]
  grade: StandingGrade
  whenAccepted(offer: Offer): void
}

export interface PatronBoardPart extends Part {
  addOffer(offer: Offer, className?: string): void
  barTheBoard(barred: boolean): void
}

export function openThePatronBoard(order: BoardOrder): PatronBoardPart {
  const board = document.createElement('section')
  board.className = 'board framed'

  const head = document.createElement('header')
  head.className = 'board__head'

  const title = document.createElement('h2')
  title.className = 'board__title'
  title.textContent = 'The Patron Board'

  const count = document.createElement('span')
  count.className = 'board__count'

  const leftTorch = drawTorchBracket()
  leftTorch.classList.add('board__torch', 'board__torch--left')

  const rightTorch = drawTorchBracket()
  rightTorch.classList.add('board__torch', 'board__torch--right')

  head.append(leftTorch, title, count, rightTorch)

  const list = document.createElement('div')
  list.className = 'board__list'

  board.append(head, list)

  const cards: OfferCardPart[] = []
  const openOnes: OfferCardPart[] = []
  let openToYou = 0
  let onTheBoard = 0
  let held = false

  function tellTheCount(): void {
    count.textContent = `${openToYou} open to you of ${onTheBoard}`
  }

  function lay(offer: Offer, className?: string, atTheTop = false): void {
    const card = layOutOffer(offer)

    if (className) {
      card.element.classList.add(className)
    }

    if (offer.claimed) {
      card.showState('claimed')
    } else if (!gradeReaches(order.grade, offer.needsGrade)) {
      card.showState('shut')
    } else {
      openToYou += 1
      openOnes.push(card)
      card.showState(held ? 'held' : offer.coinsStaked >= richEnoughToGlint ? 'rich' : 'open')
      card.whenAccepted(order.whenAccepted)
    }

    cards.push(card)
    onTheBoard += 1

    if (atTheTop) {
      list.prepend(card.element)
    } else {
      list.append(card.element)
    }

    tellTheCount()
  }

  order.offers.forEach((offer) => lay(offer))

  return {
    element: board,

    addOffer(offer: Offer, className?: string): void {
      lay(offer, className, true)
    },

    barTheBoard(barring: boolean): void {
      held = barring
      openOnes.forEach((card) => {
        card.showState(
          barring ? 'held' : card.offer.coinsStaked >= richEnoughToGlint ? 'rich' : 'open'
        )
      })
    },

    teardown(): void {
      cards.forEach((card) => card.teardown())
      board.remove()
    }
  }
}
