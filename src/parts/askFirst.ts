import type { Offer } from '../types/pact'
import type { Part } from '../types/parts'
import { countCoins, shortAddress } from '../chain/addresses'
import { sayTheBond } from '../chain/bonds'
import { latchClicks, waxPressed } from '../sound/blows'
import { drawMark } from './marks'
import '../styles/askFirst.css'

export interface AskFirstPart extends Part {
  ask(offer: Offer, score: number): void
  whenTaken(listener: (offer: Offer) => void): void
}

export function askBeforeYouSign(): AskFirstPart {
  const shroud = document.createElement('div')
  shroud.className = 'askfirst'
  shroud.hidden = true
  shroud.setAttribute('role', 'dialog')
  shroud.setAttribute('aria-modal', 'true')

  const slab = document.createElement('section')
  slab.className = 'askfirst__slab framed'

  const label = document.createElement('p')
  label.className = 'askfirst__label'
  label.append(drawMark({ name: 'seal', size: 13 }))
  label.append(document.createTextNode(' Before you sign'))

  const who = document.createElement('p')
  who.className = 'askfirst__who'

  const rows = document.createElement('div')
  rows.className = 'askfirst__rows'

  const warning = document.createElement('p')
  warning.className = 'askfirst__warning'
  warning.textContent = 'One pact at a time. You cannot take another until this raid is settled.'

  const buttons = document.createElement('div')
  buttons.className = 'askfirst__buttons'

  const away = document.createElement('button')
  away.type = 'button'
  away.className = 'askfirst__away'
  away.textContent = 'Not yet'

  const sign = document.createElement('button')
  sign.type = 'button'
  sign.className = 'askfirst__sign'
  sign.textContent = 'Take the pact'

  buttons.append(away, sign)
  slab.append(label, who, rows, warning, buttons)
  shroud.append(slab)

  const listeners = new Set<(offer: Offer) => void>()
  let onTheTable: Offer | null = null

  function line(said: string, worth: string, tone?: string): HTMLElement {
    const row = document.createElement('div')
    row.className = 'askfirst__line'

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

  function close(): void {
    shroud.hidden = true
    onTheTable = null
  }

  away.addEventListener('click', () => {
    latchClicks()
    close()
  })

  sign.addEventListener('click', () => {
    const taking = onTheTable

    if (!taking) {
      return
    }

    waxPressed()
    close()
    listeners.forEach((listener) => listener(taking))
  })

  shroud.addEventListener('pointerdown', (event) => {
    if (event.target === shroud) {
      close()
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !shroud.hidden) {
      close()
    }
  })

  return {
    element: shroud,

    ask(offer: Offer, score: number): void {
      onTheTable = offer

      who.textContent = offer.patronName ?? shortAddress(offer.patronAddress)

      rows.replaceChildren(
        line('they lend you', countCoins(offer.coinsStaked), 'askfirst__good'),
        line('they keep', `${offer.patronShare}% of what you carry out`),
        line('you must lock up', `${sayTheBond(score)} tCTC`),
        line('if you fall', 'their coin is gone, and your name takes it', 'askfirst__bad')
      )

      shroud.hidden = false
      sign.focus()
    },

    whenTaken(listener: (offer: Offer) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      shroud.remove()
    }
  }
}
