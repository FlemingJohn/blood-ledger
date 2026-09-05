import type { SealingProgress } from '../types/pact'
import type { SealingRitePart } from '../types/parts'
import '../styles/sealingRite.css'

export function prepareTheRite(): SealingRitePart {
  const shroud = document.createElement('div')
  shroud.className = 'rite'
  shroud.hidden = true
  shroud.setAttribute('role', 'status')
  shroud.setAttribute('aria-live', 'polite')

  const slab = document.createElement('div')
  slab.className = 'rite__slab'

  const title = document.createElement('h2')
  title.className = 'rite__title'
  title.textContent = 'Sealing the Pact'

  const steps = document.createElement('ol')
  steps.className = 'rite__steps'

  const meter = document.createElement('div')
  meter.className = 'meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  meter.append(filled)

  const counted = document.createElement('p')
  counted.className = 'rite__counted'

  slab.append(title, steps, meter, counted)
  shroud.append(slab)

  return {
    element: shroud,

    showProgress(progress: SealingProgress): void {
      steps.replaceChildren()

      progress.steps.forEach((entry) => {
        const line = document.createElement('li')
        line.className = `rite__step rite__step--${entry.state.replace(' ', '-')}`

        const mark = document.createElement('span')
        mark.className = 'rite__mark'
        mark.textContent =
          entry.state === 'done' ? '+' : entry.state === 'working' ? '⋯' : entry.state === 'failed' ? 'x' : '·'

        const words = document.createElement('span')
        words.textContent = entry.step

        line.append(mark, words)
        steps.append(line)
      })

      const done = progress.steps.filter((entry) => entry.state === 'done').length
      filled.style.width = `${(done / progress.steps.length) * 100}%`
      counted.textContent = `${done} of ${progress.steps.length}`
    },

    open(): void {
      shroud.hidden = false
    },

    close(): void {
      shroud.hidden = true
    },

    teardown(): void {
      shroud.remove()
    }
  }
}
