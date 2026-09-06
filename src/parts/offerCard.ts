import type { Offer, OfferState } from '../types/pact'
import type { OfferCardPart } from '../types/parts'
import { coinMark, offerMarker } from '../art/paths'
import { countCoins, shortAddress } from '../chain/addresses'
import { drawMark } from './marks'
import '../styles/offerCard.css'

export function layOutOffer(offer: Offer): OfferCardPart {
  const card = document.createElement('article')
  card.className = `offer framed${offer.reckoned ? ' offer--reckoned framed--lit' : ''}`

  const marker = document.createElement('img')
  marker.className = 'offer__marker'
  marker.src = offerMarker
  marker.alt = ''
  marker.setAttribute('aria-hidden', 'true')

  const line = document.createElement('div')
  line.className = 'offer__line'

  const who = document.createElement('span')
  who.className = 'offer__who'

  if (offer.patronName) {
    who.append(drawMark({ name: 'seal', size: 13 }))
    const named = document.createElement('b')
    named.textContent = offer.patronName
    who.append(named)
  } else {
    who.textContent = shortAddress(offer.patronAddress)
  }

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

  const share = document.createElement('span')
  share.className = 'offer__share'
  share.textContent = `${offer.patronShare}%`
  share.title = `the patron keeps ${offer.patronShare} percent of what you carry out`

  const accept = document.createElement('button')
  accept.type = 'button'
  accept.className = 'offer__accept'

  const acceptWord = document.createElement('span')
  acceptWord.textContent = 'Take'
  accept.append(acceptWord)

  const barred = document.createElement('p')
  barred.className = 'offer__barred'

  line.append(who, stake, share, accept, barred)

  card.title = offer.words
  card.append(marker, line)

  const listeners = new Set<(offer: Offer) => void>()
  accept.addEventListener('click', () => listeners.forEach((listener) => listener(offer)))

  return {
    element: card,
    offer,

    showState(state: OfferState): void {
      const closed = state === 'shut' || state === 'claimed'

      card.classList.toggle('offer--rich', state === 'rich')
      card.classList.toggle('offer--closed', closed)

      accept.hidden = closed
      barred.hidden = !closed

      if (state === 'shut') {
        barred.textContent = `needs ${offer.needsGrade}`
      }
      if (state === 'claimed') {
        barred.textContent = 'taken'
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
