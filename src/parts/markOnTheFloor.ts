import type { Part } from '../types/parts'
import '../styles/tour.css'

const wide = 64
const tall = 80

export interface FloorMarkPart extends Part {
  putItOver(atX: number, atY: number): void
  hide(): void
}

export function markSomethingOnTheFloor(): FloorMarkPart {
  const box = document.createElement('div')
  box.className = 'tourmark'
  box.hidden = true
  box.style.width = `${wide}px`
  box.style.height = `${tall}px`
  box.setAttribute('aria-hidden', 'true')

  return {
    element: box,

    putItOver(atX: number, atY: number): void {
      box.hidden = false
      box.style.left = `${Math.round(atX - wide / 2)}px`
      box.style.top = `${Math.round(atY - tall + 12)}px`
    },

    hide(): void {
      box.hidden = true
    },

    teardown(): void {
      box.remove()
    }
  }
}
