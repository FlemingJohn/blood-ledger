import type { Part } from '../types/parts'
import type { Takings } from '../types/raid'
import type { LeftBehind } from '../types/leftBehind'
import { drawMark } from './marks'
import { countCoins } from '../chain/addresses'
import { shortAddress } from '../chain/addresses'
import '../styles/reckoning.css'

export interface ReckoningPart extends Part {
  showTakings(takings: Takings, patronAddress: string, left: LeftBehind): void
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

  const missed = document.createElement('div')
  missed.className = 'reckoning__missed'

  const aside = document.createElement('p')
  aside.className = 'reckoning__aside'

  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'door door--back'

  const backWord = document.createElement('span')
  backWord.className = 'door__word'
  backWord.textContent = 'Back to the Hall'
  back.append(backWord)

  slab.append(title, where, sums, missed, aside, back)
  shroud.append(slab)

  const returning = new Set<() => void>()
  back.addEventListener('click', () => returning.forEach((listener) => listener()))

  function line(mark: 'coin' | 'blade' | 'shield' | 'skull', said: string): HTMLElement {
    const one = document.createElement('p')
    one.className = 'reckoning__left'
    one.append(drawMark({ name: mark, size: 13 }))
    one.append(document.createTextNode(` ${said}`))
    return one
  }

  function showWhatWasLeft(left: LeftBehind): void {
    const lines: HTMLElement[] = []

    if (left.gemsLeft > 0) {
      const best = left.bestGemLeft ? `, one of them ${left.bestGemLeft}` : ''
      lines.push(line('coin', `${left.gemsLeft} gems left behind${best}`))
    }

    if (left.coinsLeft > 0) {
      lines.push(line('coin', `${left.coinsLeft} in coin never picked up`))
    }

    if (left.barrelsWhole > 0) {
      lines.push(line('shield', `${left.barrelsWhole} barrels never broken open`))
    }

    left.powersUnused.forEach((power) => {
      lines.push(line('blade', `${power.said} never used`))
    })

    if (!left.metTheDemonlord) {
      lines.push(line('skull', 'you have not met the Demonlord'))
    }

    const unmet = left.breedsUnmet.filter((said) => said !== 'Demonlord')
    if (unmet.length > 0) {
      const named = unmet.slice(0, 2).join(' and ')
      const more = unmet.length > 2 ? `, and ${unmet.length - 2} more` : ''
      lines.push(line('skull', `never faced ${named}${more}`))
    }

    if (lines.length === 0) {
      missed.hidden = true
      return
    }

    const label = document.createElement('p')
    label.className = 'reckoning__missedLabel'
    label.textContent = 'You left behind'

    missed.hidden = false
    missed.replaceChildren(label, ...lines.slice(0, 5))

  }

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

    showTakings(takings: Takings, patronAddress: string, left: LeftBehind): void {
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

      showWhatWasLeft(left)

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
