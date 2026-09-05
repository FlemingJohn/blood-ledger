import type { Part } from '../types/parts'
import type { Takings } from '../types/raid'
import { countCoins } from '../chain/addresses'
import { shortAddress } from '../chain/addresses'
import '../styles/reckoning.css'

export interface ReckoningPart extends Part {
  showTakings(takings: Takings, patronAddress: string): void
  whenReturning(listener: () => void): void
}

export function prepareTheReckoning(): ReckoningPart {
  const shroud = document.createElement('div')
  shroud.className = 'reckoning'
  shroud.hidden = true
  shroud.setAttribute('role', 'status')
  shroud.setAttribute('aria-live', 'polite')

  const slab = document.createElement('div')
  slab.className = 'reckoning__slab'

  const title = document.createElement('h2')
  title.className = 'reckoning__title'

  const where = document.createElement('p')
  where.className = 'reckoning__where'

  const sums = document.createElement('div')
  sums.className = 'reckoning__sums'

  const aside = document.createElement('p')
  aside.className = 'reckoning__aside'

  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'door door--back'

  const backWord = document.createElement('span')
  backWord.className = 'door__word'
  backWord.textContent = 'Back to the Hall'
  back.append(backWord)

  slab.append(title, where, sums, aside, back)
  shroud.append(slab)

  const returning = new Set<() => void>()
  back.addEventListener('click', () => returning.forEach((listener) => listener()))

  function row(name: string, worth: string, tone: string): HTMLElement {
    const line = document.createElement('p')
    line.className = `reckoning__row reckoning__row--${tone}`

    const said = document.createElement('span')
    said.textContent = name

    const counted = document.createElement('b')
    counted.textContent = worth

    line.append(said, counted)
    return line
  }

  return {
    element: shroud,

    showTakings(takings: Takings, patronAddress: string): void {
      const lived = takings.ending === 'walked out'

      shroud.hidden = false
      shroud.classList.toggle('reckoning--lived', lived)
      shroud.classList.toggle('reckoning--fell', !lived)

      title.textContent = lived ? 'You Lived' : 'You Died'
      where.textContent = lived
        ? `walked out of floor ${takings.floorReached}`
        : `floor ${takings.floorReached}, killed by ${takings.killedBy ?? 'the dark'}`

      const moved = takings.standingAfter - takings.standingBefore

      sums.replaceChildren(
        row(
          lived ? 'carried out' : 'you carried',
          lived ? countCoins(takings.coinsCarried) : `${countCoins(takings.coinsCarried)} lost`,
          lived ? 'plain' : 'bad'
        ),
        row(
          lived ? `patron takes ${takings.patronShare}%` : 'patron lost',
          countCoins(takings.patronTakes),
          lived ? 'plain' : 'bad'
        ),
        row('you keep', countCoins(takings.youKeep), lived ? 'good' : 'bad'),
        row('debt', takings.debtCleared ? 'cleared' : 'defaulted', takings.debtCleared ? 'good' : 'bad'),
        row(
          'standing',
          `${takings.standingBefore} to ${takings.standingAfter}`,
          moved >= 0 ? 'good' : 'bad'
        )
      )

      aside.textContent = lived
        ? `${shortAddress(patronAddress)} was paid. The ledger will say so.`
        : `${shortAddress(patronAddress)} will see this.`
    },

    whenReturning(listener: () => void): void {
      returning.add(listener)
    },

    teardown(): void {
      returning.clear()
      shroud.remove()
    }
  }
}
