import type { Offer } from '../types/pact'
import type { OfferCardPart, Part } from '../types/parts'
import type { StandingGrade } from '../types/raider'
import { gradeReaches } from '../chain/theLedger'
import { layOutOffer } from './offerCard'

const richEnoughToGlint = 1000

export interface BoardOrder {
  offers: Offer[]
  grade: StandingGrade
  whenAccepted(offer: Offer): void
}

export function openThePatronBoard(order: BoardOrder): Part {
  const board = document.createElement('section')
  board.className = 'board'

  const head = document.createElement('header')
  head.className = 'board__head'

  const title = document.createElement('h2')
  title.className = 'board__title'
  title.textContent = 'The Patron Board'

  const count = document.createElement('span')
  count.className = 'board__count'

  head.append(title, count)

  const list = document.createElement('div')
  list.className = 'board__list'

  board.append(head, list)

  const cards: OfferCardPart[] = []
  let openToYou = 0

  order.offers.forEach((offer) => {
    const card = layOutOffer(offer)

    if (offer.claimed) {
      card.showState('claimed')
    } else if (!gradeReaches(order.grade, offer.needsGrade)) {
      card.showState('shut')
    } else {
      openToYou += 1
      card.showState(offer.coinsStaked >= richEnoughToGlint ? 'rich' : 'open')
      card.whenAccepted(order.whenAccepted)
    }

    cards.push(card)
    list.append(card.element)
  })

  count.textContent = `${openToYou} open to you of ${order.offers.length}`

  return {
    element: board,
    teardown(): void {
      cards.forEach((card) => card.teardown())
      board.remove()
    }
  }
}
