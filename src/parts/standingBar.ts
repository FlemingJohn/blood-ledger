import type { Part } from '../types/parts'
import type { Standing } from '../types/raider'

const highestScore = 1000

export function showStanding(standing: Standing): Part {
  const block = document.createElement('section')
  block.className = 'panel'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'Standing'

  const bar = document.createElement('div')
  bar.className = 'meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  filled.style.width = `${Math.min(100, (standing.score / highestScore) * 100)}%`
  bar.append(filled)

  const reading = document.createElement('p')
  reading.className = 'panel__reading'

  const grade = document.createElement('b')
  grade.textContent = standing.grade

  const score = document.createElement('span')
  score.textContent = `${standing.score} of ${highestScore}`

  reading.append(grade, score)

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

  block.append(label, bar, reading, tally)

  return {
    element: block,
    teardown(): void {
      block.remove()
    }
  }
}
