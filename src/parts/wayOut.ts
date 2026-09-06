import type { Part } from '../types/parts'
import { countCoins } from '../chain/addresses'
import '../styles/door.css'

export interface WayOutPart extends Part {
  showSum(carried: number, patronShare: number, owed: number): void
  showDeeperReady(ready: boolean): void
  whenLeaving(listener: () => void): void
  whenGoingDeeper(listener: () => void): void
}

export function openTheWayOut(): WayOutPart {
  const way = document.createElement('div')
  way.className = 'wayout'

  const sum = document.createElement('div')
  sum.className = 'wayout__sum'

  const deeper = document.createElement('button')
  deeper.type = 'button'
  deeper.className = 'door door--deeper'
  deeper.hidden = true

  const deeperWord = document.createElement('span')
  deeperWord.className = 'door__word'
  deeperWord.textContent = 'Go Deeper'
  deeper.append(deeperWord)

  const leave = document.createElement('button')
  leave.type = 'button'
  leave.className = 'door door--leave'

  const leaveWord = document.createElement('span')
  leaveWord.className = 'door__word'
  leaveWord.textContent = 'Extract'
  leave.append(leaveWord)

  way.append(sum, deeper, leave)

  const leaving = new Set<() => void>()
  const goingDeeper = new Set<() => void>()

  leave.addEventListener('click', () => leaving.forEach((listener) => listener()))
  deeper.addEventListener('click', () => goingDeeper.forEach((listener) => listener()))

  function row(name: string, worth: string, tone: string): HTMLElement {
    const line = document.createElement('p')
    line.className = `wayout__row wayout__row--${tone}`

    const said = document.createElement('span')
    said.textContent = name

    const counted = document.createElement('b')
    counted.textContent = worth

    line.append(said, counted)
    return line
  }

  return {
    element: way,

    showSum(carried: number, patronShare: number, owed: number): void {
      const patronTakes = Math.round((carried * patronShare) / 100)
      const youKeep = carried - patronTakes
      const cleared = carried >= owed

      sum.replaceChildren(
        row('you carry', countCoins(carried), 'plain'),
        row(`patron takes ${patronShare}%`, countCoins(patronTakes), 'plain'),
        row('you keep', countCoins(youKeep), 'good'),
        row('debt', cleared ? 'cleared' : `${countCoins(owed - carried)} short`, cleared ? 'good' : 'bad')
      )
    },

    showDeeperReady(ready: boolean): void {
      deeper.hidden = !ready
    },

    whenLeaving(listener: () => void): void {
      leaving.add(listener)
    },

    whenGoingDeeper(listener: () => void): void {
      goingDeeper.add(listener)
    },

    teardown(): void {
      leaving.clear()
      goingDeeper.clear()
      way.remove()
    }
  }
}
