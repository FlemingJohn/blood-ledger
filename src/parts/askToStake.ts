import type { Part } from '../types/parts'
import type { WhatYouOffer } from '../types/patron'
import { shortAddress } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { standingFromTheChain, timesThisPairHaveDealt } from '../chain/askTheLedger'
import { latchClicks, waxPressed } from '../sound/blows'
import { drawMark } from './marks'
import '../styles/askToStake.css'

export interface AskToStakePart extends Part {
  ask(offer: WhatYouOffer, patronAddress: string): void
  whenPutUp(listener: (offer: WhatYouOffer) => void): void
}

export function askBeforeYouStake(): AskToStakePart {
  const shroud = document.createElement('div')
  shroud.className = 'asktostake'
  shroud.hidden = true
  shroud.setAttribute('role', 'dialog')
  shroud.setAttribute('aria-modal', 'true')

  const slab = document.createElement('section')
  slab.className = 'asktostake__slab framed'

  const label = document.createElement('p')
  label.className = 'asktostake__label'
  label.append(drawMark({ name: 'coin', size: 13 }))
  label.append(document.createTextNode(' Before the coin leaves'))

  const who = document.createElement('p')
  who.className = 'asktostake__who'

  const title = document.createElement('p')
  title.className = 'asktostake__title'

  const rows = document.createElement('div')
  rows.className = 'asktostake__rows'

  const warning = document.createElement('p')
  warning.className = 'asktostake__warning'

  const buttons = document.createElement('div')
  buttons.className = 'asktostake__buttons'

  const away = document.createElement('button')
  away.type = 'button'
  away.className = 'asktostake__away'
  away.textContent = 'Keep it'

  const putUp = document.createElement('button')
  putUp.type = 'button'
  putUp.className = 'asktostake__putup'
  putUp.textContent = 'Put up the coin'

  buttons.append(away, putUp)
  slab.append(label, who, title, rows, warning, buttons)
  shroud.append(slab)

  const listeners = new Set<(offer: WhatYouOffer) => void>()
  let onTheTable: WhatYouOffer | null = null
  let asking = 0

  function line(said: string, worth: string, tone?: string): HTMLElement {
    const row = document.createElement('div')
    row.className = 'asktostake__line'

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
    asking += 1
  }

  away.addEventListener('click', () => {
    latchClicks()
    close()
  })

  putUp.addEventListener('click', () => {
    const putting = onTheTable

    if (!putting) {
      return
    }

    waxPressed()
    close()
    listeners.forEach((listener) => listener(putting))
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

    ask(offer: WhatYouOffer, patronAddress: string): void {
      onTheTable = offer
      asking += 1
      const mine = asking

      who.textContent = shortAddress(offer.raider)
      title.textContent = 'reading their name from the ledger'

      rows.replaceChildren(
        line('you lend', `${offer.coins} ETH`, 'asktostake__good'),
        line('you keep', `${offer.patronShare}% of what they carry out`),
        line('if they fall', 'your coin is gone. All of it.', 'asktostake__bad')
      )

      warning.textContent = 'The coin leaves Ethereum now. It comes back only if they walk out.'

      shroud.hidden = false
      putUp.focus()

      void Promise.all([
        standingFromTheChain(offer.raider),
        timesThisPairHaveDealt(patronAddress, offer.raider)
      ]).then(([told, pair]) => {
        if (mine !== asking) {
          return
        }

        if (!told) {
          title.textContent = 'the ledger did not answer'
          return
        }

        if (!told.known) {
          title.textContent = 'has never been down. No record at all.'
        } else {
          title.textContent = `${titleFor(told.standing.grade)} — ${told.standing.repaid} repaid, ${told.standing.lost} lost`
        }

        if (pair && pair.times > 0) {
          warning.textContent =
            `You have backed this raider ${pair.times} ${pair.times === 1 ? 'time' : 'times'} already. ` +
            (pair.wouldEarn === 0
              ? 'Another raid earns their name nothing at all.'
              : `Another earns them ${pair.wouldEarn} standing instead of 28.`)
        }
      })
    },

    whenPutUp(listener: (offer: WhatYouOffer) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      shroud.remove()
    }
  }
}
