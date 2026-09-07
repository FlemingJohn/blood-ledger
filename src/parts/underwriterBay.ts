import type { Decision } from '../types/underwriting'
import type { Part } from '../types/parts'
import { countCoins } from '../chain/addresses'
import { drawMark } from './marks'
import '../styles/bays.css'

const lowRisk = 0.34
const highRisk = 0.55

function toneFor(risk: number): string {
  if (risk < lowRisk) {
    return 'kind'
  }
  return risk < highRisk ? 'wary' : 'grim'
}

function line(said: string, worth: string, tone: string): HTMLElement {
  const row = document.createElement('p')
  row.className = 'bay__row'

  const name = document.createElement('span')
  name.textContent = said

  const counted = document.createElement('b')
  counted.className = `bay__count bay__count--${tone}`
  counted.textContent = worth

  row.append(name, counted)
  return row
}

export function readOutTheUnderwriter(decision: Decision): Part {
  const bay = document.createElement('div')
  bay.className = 'tally__bay bay--reading'

  const label = document.createElement('p')
  label.className = 'bay__label'

  const named = document.createElement('span')
  named.className = 'bay__named'
  named.append(drawMark({ name: 'seal', size: 12 }))
  named.append(document.createTextNode(' The Underwriter'))

  const aside = document.createElement('span')
  aside.className = 'bay__aside'
  aside.textContent = 'reads you'

  label.append(named, aside)

  const risk = Math.round(decision.riskOfDefault * 100)
  const tone = toneFor(decision.riskOfDefault)

  const track = document.createElement('div')
  track.className = 'bay__track'

  const run = document.createElement('div')
  run.className = `bay__run bay__run--${tone}`
  run.style.width = `${Math.max(3, Math.min(100, risk))}%`
  track.append(run)

  const lends =
    decision.verdict === 'refuse'
      ? line('will lend', 'nothing', 'grim')
      : line('will lend', `${countCoins(Math.round(Number(decision.coinsOffered)))} at ${decision.patronShare}%`, 'plain')

  const marks = document.createElement('div')
  marks.className = 'bay__marks'

  if (decision.flags.length === 0) {
    const clean = document.createElement('span')
    clean.className = 'bay__mark bay__mark--clean'
    clean.textContent = 'no marks against you'
    marks.append(clean)
  } else {
    decision.flags.slice(0, 2).forEach((flag) => {
      const mark = document.createElement('span')
      mark.className = 'bay__mark'
      mark.textContent = flag
      marks.append(mark)
    })

    if (decision.flags.length > 2) {
      const more = document.createElement('span')
      more.className = 'bay__mark bay__mark--more'
      more.textContent = `+${decision.flags.length - 2}`
      marks.append(more)
    }
  }

  bay.append(label, line('risk of default', `${risk}%`, tone), track, lends, marks)

  return {
    element: bay,
    teardown(): void {
      bay.remove()
    }
  }
}
