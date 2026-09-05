import type { Offer, OfferState } from '../types/pact'
import type { OfferCardPart } from '../types/parts'
import { coinMark, offerMarker } from '../art/paths'
import { countCoins, shortAddress } from '../chain/addresses'
import '../styles/offerCard.css'

const shutWords: Record<string, string> = {
  shut: 'standing too low',
  claimed: 'already taken'
}

export function layOutOffer(offer: Offer): OfferCardPart {
  const card = document.createElement('article')
  card.className = 'offer'

  const marker = document.createElement('img')
  marker.className = 'offer__marker'
  marker.src = offerMarker
  marker.alt = ''
  marker.setAttribute('aria-hidden', 'true')

  const head = document.createElement('header')
  head.className = 'offer__head'

  const who = document.createElement('span')
  who.className = 'offer__who'
  who.textContent = shortAddress(offer.patronAddress)

  const stake = document.createElement('span')
  stake.className = 'offer__stake'

  const coin = document.createElement('img')
  coin.className = 'offer__coin'
  coin.src = coinMark
  coin.alt = ''
  coin.setAttribute('aria-hidden', 'true')

  const amount = document.createElement('b')
  amount.textContent = countCoins(offer.coinsStaked)

  stake.append(coin, amount)
  head.append(who, stake)

  const terms = document.createElement('p')
  terms.className = 'offer__terms'
  terms.textContent = `keeps ${offer.patronShare} percent of what you carry out`

  const words = document.createElement('p')
  words.className = 'offer__words'
  words.textContent = offer.words

  const accept = document.createElement('button')
  accept.type = 'button'
  accept.className = 'offer__accept'

  const acceptWord = document.createElement('span')
  acceptWord.textContent = 'Accept'
  accept.append(acceptWord)

  const barred = document.createElement('p')
  barred.className = 'offer__barred'

  card.append(marker, head, terms, words, accept, barred)

  const listeners = new Set<(offer: Offer) => void>()
  accept.addEventListener('click', () => listeners.forEach((listener) => listener(offer)))

  return {
    element: card,
    offer,

    showState(state: OfferState): void {
      card.classList.toggle('offer--rich', state === 'rich')
      card.classList.toggle('offer--closed', state === 'shut' || state === 'claimed')

      const closed = state === 'shut' || state === 'claimed'
      accept.hidden = closed
      barred.hidden = !closed

      if (state === 'shut') {
        barred.textContent = `${shutWords.shut} — needs ${offer.needsGrade}`
      }
      if (state === 'claimed') {
        barred.textContent = shutWords.claimed ?? ''
      }
    },

    whenAccepted(listener: (offer: Offer) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      card.remove()
    }
  }
}
