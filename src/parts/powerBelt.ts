import type { Part } from '../types/parts'
import type { Power } from '../types/power'
import type { World } from '../dungeon/world'
import { powerRestShare } from '../dungeon/world'

const keysShown = ['Q', 'E']

export interface PowerBeltPart extends Part {
  showRest(world: World, now: number): void
}

export function buckleThePowerBelt(powers: Power[]): PowerBeltPart {
  const belt = document.createElement('div')
  belt.className = 'belt'

  const slots = powers.map((power, place) => {
    const slot = document.createElement('div')
    slot.className = 'belt__slot'

    const key = document.createElement('span')
    key.className = 'belt__key'
    key.textContent = keysShown[place] ?? String(place + 1)

    const said = document.createElement('span')
    said.className = 'belt__said'
    said.textContent = power.said

    const rest = document.createElement('div')
    rest.className = 'belt__rest'

    const filled = document.createElement('div')
    filled.className = 'belt__filled'
    rest.append(filled)

    slot.append(key, said, rest)
    belt.append(slot)

    return { power, slot, filled }
  })

  return {
    element: belt,

    showRest(world: World, now: number): void {
      slots.forEach((slot) => {
        const share = powerRestShare(world, slot.power, now)
        slot.filled.style.width = `${share * 100}%`
        slot.slot.classList.toggle('belt__slot--ready', share >= 1)
      })
    },

    teardown(): void {
      belt.remove()
    }
  }
}
