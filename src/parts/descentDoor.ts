import type { DescentPart } from '../types/parts'
import { bladeSweep } from '../art/paths'
import { loadPicture } from '../art/pictures'
import '../styles/door.css'

export function buildDescent(): DescentPart {
  const way = document.createElement('div')
  way.className = 'stairway'

  const door = document.createElement('button')
  door.type = 'button'
  door.className = 'door door--descent'

  const word = document.createElement('span')
  word.className = 'door__word'
  word.textContent = 'Descend'
  door.append(word)

  const aside = document.createElement('p')
  aside.className = 'doorway__aside'

  way.append(door, aside)

  loadPicture(bladeSweep[3] ?? '')
    .then((picture) => {
      const sweep = document.createElement('img')
      sweep.className = 'door__sweep'
      sweep.src = picture.src
      sweep.alt = ''
      sweep.setAttribute('aria-hidden', 'true')
      door.append(sweep)
    })
    .catch(() => undefined)

  const listeners = new Set<() => void>()
  door.addEventListener('click', () => listeners.forEach((listener) => listener()))

  return {
    element: way,

    showBarred(barred: boolean): void {
      door.disabled = barred
      door.classList.toggle('door--barred', barred)
      aside.textContent = barred
        ? 'Accept an offer before you go down'
        : 'The stair is open. Nothing comes back for you.'
    },

    whenPushed(listener: () => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      way.remove()
    }
  }
}
