import type { Pact } from '../types/pact'
import type { Part } from '../types/parts'
import { countCoins, shortAddress } from '../chain/addresses'
import { drawWaxSeal } from './hallMarks'

export interface PactSlipPart extends Part {
  showPact(pact: Pact | null): void
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

  function showNone(): void {
    seal.setAttribute('hidden', 'true')
    who.replaceChildren()
    body.replaceChildren(document.createTextNode('None yet. Take an offer to go down.'))
    body.className = 'panel__empty'
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
