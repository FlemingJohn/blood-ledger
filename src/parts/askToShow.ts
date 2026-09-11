import type { Part } from '../types/parts'
import { latchClicks } from '../sound/blows'
import { drawMark } from './marks'
import '../styles/tour.css'

export interface AskToShowPart extends Part {
  ask(said: string): void
  close(): void
  whenWanted(listener: () => void): void
  whenWaved(listener: () => void): void
}

export function askIfTheyWantShowing(): AskToShowPart {
  const strip = document.createElement('div')
  strip.className = 'tourask'
  strip.hidden = true

  const said = document.createElement('p')
  said.className = 'tourask__said'

  const yes = document.createElement('button')
  yes.type = 'button'
  yes.className = 'tourask__yes'
  yes.append(drawMark({ name: 'stair', size: 13 }))
  yes.append(document.createTextNode(' Show me'))

  const no = document.createElement('button')
  no.type = 'button'
  no.className = 'tourask__no'
  no.textContent = 'I know my way'

  strip.append(said, yes, no)

  const wanted = new Set<() => void>()
  const waved = new Set<() => void>()

  function close(): void {
    strip.hidden = true
  }

  yes.addEventListener('click', () => {
    latchClicks()
    close()
    wanted.forEach((listener) => listener())
  })

  function wave(): void {
    latchClicks()
    close()
    waved.forEach((listener) => listener())
  }

  no.addEventListener('click', wave)

  function onKey(blow: KeyboardEvent): void {
    if (blow.key === 'Escape' && !strip.hidden) {
      wave()
    }
  }

  window.addEventListener('keydown', onKey)

  return {
    element: strip,

    ask(words: string): void {
      said.textContent = words
      strip.hidden = false
    },

    close,

    whenWanted(listener: () => void): void {
      wanted.add(listener)
    },

    whenWaved(listener: () => void): void {
      waved.add(listener)
    },

    teardown(): void {
      window.removeEventListener('keydown', onKey)
      wanted.clear()
      waved.clear()
      strip.remove()
    }
  }
}
