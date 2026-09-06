import type { Part } from '../types/parts'
import type { Standing } from '../types/raider'
import { gradeFloors } from '../chain/theLedger'

const highestScore = 1000

export function showStanding(standing: Standing): Part {
  const block = document.createElement('section')
  block.className = 'panel framed'

  const head = document.createElement('div')
  head.className = 'panel__head'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'Standing'

  const reading = document.createElement('p')
  reading.className = 'panel__reading'

  const grade = document.createElement('b')
  grade.textContent = standing.grade

  const score = document.createElement('span')
  score.textContent = String(standing.score)

  reading.append(grade, score)
  head.append(label, reading)

  const bar = document.createElement('div')
  bar.className = 'meter meter--notched'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  filled.style.width = `${Math.min(100, (standing.score / highestScore) * 100)}%`
  bar.append(filled)

  const rungs = document.createElement('div')
  rungs.className = 'meter__rungs'
  rungs.setAttribute('aria-hidden', 'true')

  gradeFloors
    .slice()
    .reverse()
    .forEach((step) => {
      if (step.from <= 0) {
        return
      }
      const notch = document.createElement('u')
      notch.className = standing.score >= step.from ? 'meter__notch meter__notch--past' : 'meter__notch'
      notch.style.left = `${(step.from / highestScore) * 100}%`
      rungs.append(notch)
    })

  bar.append(rungs)

  const ladder = document.createElement('p')
  ladder.className = 'meter__ladder'
  ladder.setAttribute('aria-hidden', 'true')

  gradeFloors
    .slice()
    .reverse()
    .forEach((step) => {
      const rung = document.createElement('span')
      rung.textContent = step.grade
      rung.className = standing.score >= step.from ? 'is-past' : ''
      ladder.append(rung)
    })

  const tally = document.createElement('p')
  tally.className = 'panel__tally'

  const raids = document.createElement('span')
  raids.textContent = `${standing.raids} raids`

  const repaid = document.createElement('span')
  repaid.className = 'panel__good'
  repaid.textContent = `${standing.repaid} repaid`

  const lost = document.createElement('span')
  lost.className = 'panel__bad'
  lost.textContent = `${standing.lost} lost`

  tally.append(raids, repaid, lost)

  block.append(head, bar, ladder, tally)

  return {
    element: block,
    teardown(): void {
      block.remove()
    }
  }
}
