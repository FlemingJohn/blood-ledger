import type { Part } from '../types/parts'
import { drawMark } from './marks'
import '../styles/descending.css'

const steps = ['Waking the stair', 'Carving the floor', 'Arming what waits'] as const

export interface DescendingPart extends Part {
  showFloor(floor: number): void
  reached(step: number): void
  done(): void
}

export function coverTheStair(): DescendingPart {
  const shroud = document.createElement('div')
  shroud.className = 'descending'
  shroud.setAttribute('role', 'status')
  shroud.setAttribute('aria-live', 'polite')

  const slab = document.createElement('div')
  slab.className = 'descending__slab'

  const mark = drawMark({ name: 'stair', size: 30 })
  mark.classList.add('descending__mark')

  const word = document.createElement('p')
  word.className = 'descending__word'
  word.textContent = 'Descending'

  const floor = document.createElement('p')
  floor.className = 'descending__floor'

  const rail = document.createElement('div')
  rail.className = 'descending__rail'

  const filled = document.createElement('span')
  filled.className = 'descending__filled'
  rail.append(filled)

  const said = document.createElement('p')
  said.className = 'descending__said'
  said.textContent = steps[0]

  const aside = document.createElement('p')
  aside.className = 'descending__aside'
  aside.textContent = 'Nothing comes back for you.'

  slab.append(mark, word, floor, rail, said, aside)
  shroud.append(slab)

  let closing = false

  return {
    element: shroud,

    showFloor(deep: number): void {
      floor.textContent = `Floor ${deep}`
    },

    reached(step: number): void {
      const held = Math.max(0, Math.min(steps.length, step))
      filled.style.width = `${Math.round((held / steps.length) * 100)}%`
      said.textContent = steps[Math.min(held, steps.length - 1)] ?? ''
    },

    done(): void {
      if (closing) {
        return
      }
      closing = true
      filled.style.width = '100%'
      said.textContent = 'The stair is open'
      shroud.classList.add('descending--lifting')
      window.setTimeout(() => shroud.remove(), 620)
    },

    teardown(): void {
      shroud.remove()
    }
  }
}
