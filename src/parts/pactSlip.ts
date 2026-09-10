import type { Offer, Pact } from '../types/pact'
import type { Part } from '../types/parts'
import { countCoins, shortAddress } from '../chain/addresses'
import { sayTheBond } from '../chain/bonds'
import { drawEmptyHook, drawWaxSeal } from './hallMarks'

export interface PactSlipPart extends Part {
  showPact(pact: Pact | null): void
  showWhatItWouldCost(offer: Offer | null, score: number): void
}

export function pinUpThePact(): PactSlipPart {
  const slip = document.createElement('section')
  slip.className = 'panel framed'

  const head = document.createElement('div')
  head.className = 'panel__head'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'Pact'

  const who = document.createElement('p')
  who.className = 'panel__reading'

  head.append(label, who)

  const body = document.createElement('p')
  body.className = 'panel__tally'

  const seal = drawWaxSeal()
  seal.classList.add('panel__seal')
  seal.setAttribute('hidden', 'true')

  slip.append(head, body, seal)

  let bestOffer: Offer | null = null
  let yourScore = 0

  function line(said: string, worth: string, tone?: string): HTMLElement {
    const row = document.createElement('div')
    row.className = 'pactahead__line'

    const name = document.createElement('span')
    name.textContent = said

    const figure = document.createElement('b')
    figure.textContent = worth

    if (tone) {
      figure.classList.add(tone)
    }

    row.append(name, figure)
    return row
  }

  function showNone(): void {
    seal.setAttribute('hidden', 'true')
    who.replaceChildren()

    if (!bestOffer) {
      const hook = drawEmptyHook()
      hook.classList.add('panel__hook')

      const said = document.createElement('span')
      said.textContent = 'None yet. Nothing on the board reaches you.'

      body.replaceChildren(hook, said)
      body.className = 'panel__empty'
      return
    }

    const named = document.createElement('span')
    named.className = 'pactahead__from'
    named.textContent = bestOffer.patronName ?? shortAddress(bestOffer.patronAddress)
    who.replaceChildren(named)

    const ahead = document.createElement('div')
    ahead.className = 'pactahead'

    ahead.append(
      line('they would lend', countCoins(bestOffer.coinsStaked), 'pactahead__good'),
      line('they would keep', `${bestOffer.patronShare}%`),
      line('your bond', `${sayTheBond(yourScore)} tCTC`)
    )

    const aside = document.createElement('p')
    aside.className = 'pactahead__aside'
    aside.textContent = 'The kindest terms open to you. Take it and the stair unbars.'

    body.replaceChildren(ahead, aside)
    body.className = 'panel__ahead'
  }

  function showSealed(pact: Pact): void {
    seal.removeAttribute('hidden')
    const patron = document.createElement('b')
    patron.textContent = shortAddress(pact.patronAddress)
    who.replaceChildren(patron)

    const debt = document.createElement('span')
    debt.className = 'panel__bad'
    debt.textContent = `debt ${countCoins(pact.coinsStaked)}`

    const cut = document.createElement('span')
    cut.textContent = `they keep ${pact.patronShare}%`

    body.className = 'panel__tally'
    body.replaceChildren(debt, cut)
  }

  showNone()

  return {
    element: slip,

    showWhatItWouldCost(offer: Offer | null, score: number): void {
      bestOffer = offer
      yourScore = score
      showNone()
    },

    showPact(pact: Pact | null): void {
      if (pact) {
        showSealed(pact)
        return
      }
      showNone()
    },

    teardown(): void {
      slip.remove()
    }
  }
}
