import type { PlinthPart } from '../types/parts'
import type { RaiderClass } from '../types/raider'
import { champions } from '../art/champions'
import { drawAlcove, drawChampion } from './marks'
import '../styles/plinth.css'

const everyClass: RaiderClass[] = ['warrior', 'knight', 'fighter']
const shortestChampion = 132
const tallestChampion = 248
const roomBelowTheFeet = 34

export function raiseThePlinth(startingClass: RaiderClass): PlinthPart {
  const plinth = document.createElement('div')
  plinth.className = 'plinth'

  const stage = document.createElement('div')
  stage.className = 'plinth__stage'

  stage.append(drawAlcove())

  const figure = document.createElement('div')
  figure.className = 'plinth__figure'
  stage.append(figure)

  const chooser = document.createElement('div')
  chooser.className = 'plinth__chooser framed'

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

  const line = document.createElement('p')
  line.className = 'plinth__line'

  plinth.append(stage, chooser, line)

  const listeners = new Set<(chosen: RaiderClass) => void>()
  let showing = startingClass

  function howTallHeMayStand(): number {
    const room = stage.clientHeight - roomBelowTheFeet
    if (room <= 0) {
      return shortestChampion
    }
    return Math.max(shortestChampion, Math.min(tallestChampion, Math.round(room)))
  }

  function paint(): void {
    const kit = champions[showing]
    name.textContent = kit.said
    line.textContent = kit.line
    figure.replaceChildren(drawChampion(showing, howTallHeMayStand()))
  }

  const watchTheStage = new ResizeObserver(() => paint())
  watchTheStage.observe(stage)

  function stepBy(move: number): void {
    const at = everyClass.indexOf(showing)
    const next = everyClass[(at + move + everyClass.length) % everyClass.length]
    if (!next || next === showing) {
      return
    }
    showing = next
    paint()
    listeners.forEach((listener) => listener(next))
  }

  back.addEventListener('click', () => stepBy(-1))
  on.addEventListener('click', () => stepBy(1))

  paint()

  return {
    element: plinth,

    showClass(chosen: RaiderClass): void {
      if (chosen === showing) {
        return
      }
      showing = chosen
      paint()
    },

    whenClassChanged(listener: (chosen: RaiderClass) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      watchTheStage.disconnect()
      listeners.clear()
      plinth.remove()
    }
  }
}
