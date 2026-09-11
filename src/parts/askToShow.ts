import type { Part } from '../types/parts'
import { latchClicks } from '../sound/blows'
import { drawMark } from './marks'
import '../styles/tour.css'

export interface AskToShowPart extends Part {
  ask(said: string, aside?: string): void
  close(): void
  whenWanted(listener: () => void): void
  whenWaved(listener: () => void): void
}

export function askIfTheyWantShowing(): AskToShowPart {
  const shroud = document.createElement('div')
  shroud.className = 'tourask'
  shroud.hidden = true
  shroud.setAttribute('role', 'dialog')
  shroud.setAttribute('aria-modal', 'true')

  const slab = document.createElement('section')
  slab.className = 'tourask__slab framed'

  const label = document.createElement('p')
  label.className = 'tourask__label'
  label.append(drawMark({ name: 'stair', size: 13 }))
  label.append(document.createTextNode(' Show me round'))

  const said = document.createElement('p')
  said.className = 'tourask__said'

  const aside = document.createElement('p')
  aside.className = 'tourask__aside'

  const buttons = document.createElement('div')
  buttons.className = 'tourask__buttons'

  const no = document.createElement('button')
  no.type = 'button'
  no.className = 'tourask__no'
  no.textContent = 'I know my way'

  const yes = document.createElement('button')
  yes.type = 'button'
  yes.className = 'tourask__yes'
  yes.textContent = 'Show me'

  const escaped = document.createElement('p')
  escaped.className = 'tourask__escaped'
  escaped.textContent = 'esc to close'

  buttons.append(no, yes)
  slab.append(label, said, aside, buttons, escaped)
  shroud.append(slab)

  const wanted = new Set<() => void>()
  const waved = new Set<() => void>()

  function close(): void {
    shroud.hidden = true
  }

  function wave(): void {
    latchClicks()
    close()
    waved.forEach((listener) => listener())
  }

  function take(): void {
    latchClicks()
    close()
    wanted.forEach((listener) => listener())
  }

  yes.addEventListener('click', take)
  no.addEventListener('click', wave)

  shroud.addEventListener('click', (blow) => {
    if (blow.target === shroud) {
      wave()
    }
  })

  function onKey(blow: KeyboardEvent): void {
    if (blow.key === 'Escape' && !shroud.hidden) {
      wave()
    }
  }

  window.addEventListener('keydown', onKey)

  return {
    element: shroud,

    ask(words: string, second?: string): void {
      said.textContent = words
      aside.textContent = second ?? ''
      aside.hidden = !second
      shroud.hidden = false
      yes.focus()
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
      shroud.remove()
    }
  }
}
