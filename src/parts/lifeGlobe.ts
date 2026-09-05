import type { Part } from '../types/parts'

export interface LifeGlobePart extends Part {
  showLife(left: number, full: number): void
}

export function hangTheLifeGlobe(): LifeGlobePart {
  const globe = document.createElement('div')
  globe.className = 'life'

  const reading = document.createElement('p')
  reading.className = 'life__reading'

  const meter = document.createElement('div')
  meter.className = 'meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled life__filled'
  meter.append(filled)

  globe.append(reading, meter)

  return {
    element: globe,

    showLife(left: number, full: number): void {
      const share = Math.max(0, Math.min(1, left / full))
      const asPercent = Math.round(share * 100)

      reading.textContent = `${asPercent}%`
      filled.style.width = `${share * 100}%`

      globe.classList.toggle('life--hurt', share <= 0.5 && share > 0.25)
      globe.classList.toggle('life--dying', share <= 0.25)
      document.body.classList.toggle('body--dying', share <= 0.25 && share > 0)
    },

    teardown(): void {
      document.body.classList.remove('body--dying')
      globe.remove()
    }
  }
}
