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

  const chooser = document.createElement('div')
  chooser.className = 'plinth__chooser'

  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'plinth__step'
  back.textContent = '◂'
  back.setAttribute('aria-label', 'previous class')

  const name = document.createElement('p')
  name.className = 'plinth__name'

  const on = document.createElement('button')
  on.type = 'button'
  on.className = 'plinth__step'
  on.textContent = '▸'
  on.setAttribute('aria-label', 'next class')

  chooser.append(back, name, on)
  plinth.append(stage, chooser)

  const listeners = new Set<(chosen: RaiderClass) => void>()
  let showing = startingClass
  let running: RunningFlipbook | null = null

  async function paint(): Promise<void> {
    name.textContent = showing

    const frames = raiderPoses[showing]
    try {
      const next = await startFlipbook({
        frames,
        framesPerSecond: 8,
        trimToContent: true,
        faintestKept: 24,
        magnify: 3
      })
      running?.stop()
      running = next
      figure.replaceChildren(next.canvas)
    } catch {
      figure.replaceChildren()
    }
  }

  function stepBy(move: number): void {
    const at = everyClass.indexOf(showing)
    const next = everyClass[(at + move + everyClass.length) % everyClass.length]
    if (!next || next === showing) {
      return
    }
    showing = next
    void paint()
    listeners.forEach((listener) => listener(next))
  }

  back.addEventListener('click', () => stepBy(-1))
  on.addEventListener('click', () => stepBy(1))

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
