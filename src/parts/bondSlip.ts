import type { Part } from '../types/parts'
import type { Standing } from '../types/raider'
import { titleFor } from '../chain/ranks'
import { bondFor, bondShareFor } from '../chain/bonds'
import { drawMark } from './marks'
import '../styles/rail.css'

export interface BondPart extends Part {
  showStanding(standing: Standing): void
  showOwed(owed: number): void
}

export function showTheBond(first: Standing): BondPart {
  let standing = first

  const block = document.createElement('section')
  block.className = 'rail__block rail__block--bond framed'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.append(drawMark({ name: 'shield', size: 12 }))
  label.append(document.createTextNode(' The Bond'))

  const asked = document.createElement('p')
  asked.className = 'bond__asked'

  const amount = document.createElement('b')
  asked.append(amount)

  const why = document.createElement('p')
  why.className = 'bond__why'

  const meter = document.createElement('div')
  meter.className = 'meter bond__meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled bond__filled'
  meter.append(filled)

  block.append(label, asked, meter, why)

  function paint(owed: number): void {
    const share = bondShareFor(standing.score)

    amount.textContent = owed === 0 ? 'nothing' : `${owed.toFixed(3)} tCTC`
    filled.style.width = `${share}%`
    why.textContent =
      owed === 0
        ? `${titleFor(standing.grade)} posts no bond. Your name is the collateral.`
        : `${titleFor(standing.grade)} locks up ${share} percent. It comes back if you walk out.`
  }

  paint(bondFor(standing.score))

  return {
    element: block,

    showStanding(told: Standing): void {
      standing = told
      paint(bondFor(told.score))
    },

    showOwed(owed: number): void {
      paint(owed)
    },

    teardown(): void {
      block.remove()
    }
  }
}
