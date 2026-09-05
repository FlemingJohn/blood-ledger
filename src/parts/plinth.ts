import type { PlinthPart } from '../types/parts'
import type { RaiderClass } from '../types/raider'
import type { RunningFlipbook } from '../types/flipbook'
import { raiderPoses, standingRing } from '../art/paths'
import { startFlipbook } from '../art/flipbook'
import '../styles/plinth.css'

const everyClass: RaiderClass[] = ['warrior', 'knight', 'fighter']

export function raiseThePlinth(startingClass: RaiderClass): PlinthPart {
  const plinth = document.createElement('div')
  plinth.className = 'plinth'

  const stage = document.createElement('div')
  stage.className = 'plinth__stage'

  const ring = document.createElement('img')
  ring.className = 'plinth__ring'
  ring.src = standingRing
  ring.alt = ''
  ring.setAttribute('aria-hidden', 'true')

  const figure = document.createElement('div')
  figure.className = 'plinth__figure'

  stage.append(ring, figure)

  const name = document.createElement('p')
  name.className = 'plinth__name'

  const chooser = document.createElement('div')
  chooser.className = 'plinth__chooser'

  plinth.append(stage, name, chooser)

  const listeners = new Set<(chosen: RaiderClass) => void>()
  let showing = startingClass
  let running: RunningFlipbook | null = null

  const buttons = everyClass.map((chosen) => {
    const pick = document.createElement('button')
    pick.type = 'button'
    pick.className = 'plinth__pick'
    pick.textContent = chosen
    pick.addEventListener('click', () => {
      if (chosen === showing) {
        return
      }
      showing = chosen
      void paint()
      listeners.forEach((listener) => listener(chosen))
    })
    chooser.append(pick)
    return { chosen, pick }
  })

  async function paint(): Promise<void> {
    name.textContent = showing
    buttons.forEach((entry) => {
      entry.pick.setAttribute('aria-pressed', entry.chosen === showing ? 'true' : 'false')
    })

    const frames = raiderPoses[showing]
    try {
      const next = await startFlipbook({ frames, framesPerSecond: 8 })
      running?.stop()
      running = next
      figure.replaceChildren(next.canvas)
    } catch {
      figure.replaceChildren()
    }
  }

  void paint()

  return {
    element: plinth,

    showClass(chosen: RaiderClass): void {
      if (chosen === showing) {
        return
      }
      showing = chosen
      void paint()
    },

    whenClassChanged(listener: (chosen: RaiderClass) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      running?.stop()
      plinth.remove()
    }
  }
}
