import type { ScrollPart } from '../types/parts'
import '../styles/scroll.css'

export interface ScrollOrder {
  title: string
  steps: string[]
  note?: string
}

export function buildScroll(order: ScrollOrder): ScrollPart {
  const scroll = document.createElement('details')
  scroll.className = 'scroll'

  const title = document.createElement('summary')
  title.className = 'scroll__title'

  const mark = document.createElement('span')
  mark.className = 'scroll__mark'
  mark.setAttribute('aria-hidden', 'true')

  const titleWords = document.createElement('span')
  titleWords.textContent = order.title

  title.append(mark, titleWords)

  const body = document.createElement('div')
  body.className = 'scroll__body'

  const steps = document.createElement('ol')
  steps.className = 'scroll__steps'

  order.steps.forEach((line) => {
    const step = document.createElement('li')
    step.className = 'scroll__step'
    const words = document.createElement('span')
    words.textContent = line
    step.append(words)
    steps.append(step)
  })

  body.append(steps)

  if (order.note) {
    const note = document.createElement('p')
    note.className = 'scroll__note'
    note.textContent = order.note
    body.append(note)
  }

  scroll.append(title, body)

  return {
    element: scroll,
    title: order.title,

    isOpen(): boolean {
      return scroll.open
    },

    closeScroll(): void {
      scroll.open = false
    },

    teardown(): void {
      scroll.remove()
    }
  }
}
