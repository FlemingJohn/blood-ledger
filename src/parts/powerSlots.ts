import type { Part } from '../types/parts'
import type { RaiderClass } from '../types/raider'
import { powersFor } from '../dungeon/powers'
import { drawMark } from './marks'
import '../styles/rail.css'

const keysShown = ['Q', 'E']

export interface PowerSlotsPart extends Part {
  showClass(chosen: RaiderClass): void
}

export function layOutPowers(startingClass: RaiderClass): PowerSlotsPart {
  const block = document.createElement('section')
  block.className = 'rail__block framed'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.append(drawMark({ name: 'seal', size: 12 }))
  label.append(document.createTextNode(' Your Powers'))

  const slots = document.createElement('div')
  slots.className = 'powers'

  block.append(label, slots)

  function paint(chosen: RaiderClass): void {
    slots.replaceChildren()

    powersFor(chosen).forEach((power, place) => {
      const slot = document.createElement('div')
      slot.className = 'powers__slot framed framed--sunk'

      const key = document.createElement('span')
      key.className = 'powers__key'
      key.textContent = keysShown[place] ?? String(place + 1)

      const said = document.createElement('span')
      said.className = 'powers__said'
      said.textContent = power.said

      const rests = document.createElement('span')
      rests.className = 'powers__rests'
      rests.textContent = `${Math.round(power.restsFor / 1000)}s`

      slot.append(key, said, rests)
      slots.append(slot)
    })
  }

  paint(startingClass)

  return {
    element: block,

    showClass(chosen: RaiderClass): void {
      paint(chosen)
    },

    teardown(): void {
      block.remove()
    }
  }
}
