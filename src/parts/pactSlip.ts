import type { Pact } from '../types/pact'
import type { Part } from '../types/parts'
import { countCoins, shortAddress } from '../chain/addresses'

export interface PactSlipPart extends Part {
  showPact(pact: Pact | null): void
}

export function pinUpThePact(): PactSlipPart {
  const slip = document.createElement('section')
  slip.className = 'panel'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'Your Pact'

  const body = document.createElement('div')
  body.className = 'panel__body'

  slip.append(label, body)

  function showNone(): void {
    const empty = document.createElement('p')
    empty.className = 'panel__empty'
    empty.textContent = 'None. Accept an offer to go down.'
    body.replaceChildren(empty)
  }

  function showSealed(pact: Pact): void {
    const patron = document.createElement('p')
    patron.className = 'panel__reading'

    const who = document.createElement('b')
    who.textContent = shortAddress(pact.patronAddress)

    const owed = document.createElement('span')
    owed.textContent = `owes ${countCoins(pact.coinsStaked)}`

    patron.append(who, owed)

    const share = document.createElement('p')
    share.className = 'panel__tally'

    const cut = document.createElement('span')
    cut.textContent = `they keep ${pact.patronShare} percent`

    const debt = document.createElement('span')
    debt.className = 'panel__bad'
    debt.textContent = `debt ${countCoins(pact.coinsStaked)}`

    share.append(cut, debt)

    body.replaceChildren(patron, share)
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
