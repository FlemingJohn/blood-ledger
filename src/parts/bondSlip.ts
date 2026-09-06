import type { Part } from '../types/parts'
import type { Standing } from '../types/raider'
import { titleFor } from '../chain/ranks'
import { drawMark } from './marks'
import '../styles/rail.css'

const fullBond = 0.1

function bondShareFor(score: number): number {
  if (score >= 900) {
    return 0
  }
  if (score >= 750) {
    return 10
  }
  if (score >= 600) {
    return 30
  }
  if (score >= 450) {
    return 60
  }
  if (score >= 300) {
    return 80
  }
  return 100
}

export function showTheBond(standing: Standing): Part {
  const block = document.createElement('section')
  block.className = 'rail__block'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.append(drawMark({ name: 'shield', size: 12 }))
  label.append(document.createTextNode(' The Bond'))

  const share = bondShareFor(standing.score)
  const owed = (fullBond * share) / 100

  const asked = document.createElement('p')
  asked.className = 'bond__asked'

  const amount = document.createElement('b')
  amount.textContent = owed === 0 ? 'nothing' : `${owed.toFixed(3)} tCTC`
  asked.append(amount)

  const why = document.createElement('p')
  why.className = 'bond__why'
  why.textContent =
    owed === 0
      ? `${titleFor(standing.grade)} posts no bond. Your name is the collateral.`
      : `${titleFor(standing.grade)} locks up ${share} percent. It comes back if you walk out.`

  const meter = document.createElement('div')
  meter.className = 'meter bond__meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled bond__filled'
  filled.style.width = `${share}%`
  meter.append(filled)

  block.append(label, asked, meter, why)

  return {
    element: block,
    teardown(): void {
      block.remove()
    }
  }
}
