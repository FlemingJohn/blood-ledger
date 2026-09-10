import type { Part } from '../types/parts'
import { hoodedSkull } from '../art/paths'
import { carveTheHero } from '../art/heroStage'
import { doneWaitingOn, holdTheBootFor, sayWhileBooting } from './theBoot'

export function raiseTheHero(): Part {
  const hero = document.createElement('div')
  hero.className = 'hero'

  const named = document.createElement('h1')
  named.className = 'hero__named'
  named.textContent = 'Blood Ledger'

  const stillOne = document.createElement('img')
  stillOne.className = 'hero__still'
  stillOne.src = hoodedSkull
  stillOne.alt = ''
  stillOne.decoding = 'async'
  stillOne.setAttribute('aria-hidden', 'true')

  hero.append(named, stillOne)

  holdTheBootFor('hero')
  sayWhileBooting('Waking the watcher')

  const carved = carveTheHero(hero, () => {
    stillOne.classList.add('hero__still--gone')
    doneWaitingOn('hero')
  })

  return {
    element: hero,

    teardown(): void {
      carved.stop()
      hero.remove()
    }
  }
}

export function cutAnOrnament(): SVGSVGElement {
  const drawnIn = 'http://www.w3.org/2000/svg'
  const mark = document.createElementNS(drawnIn, 'svg')

  mark.setAttribute('viewBox', '0 0 220 18')
  mark.setAttribute('class', 'ornament')
  mark.setAttribute('aria-hidden', 'true')

  const lines = [
    'M0 9 H86',
    'M134 9 H220',
    'M110 1 L117 9 L110 17 L103 9 Z',
    'M110 4.4 L114 9 L110 13.6 L106 9 Z',
    'M95 9 L100 6.4 L100 11.6 Z',
    'M125 9 L120 6.4 L120 11.6 Z'
  ]

  lines.forEach((line, at) => {
    const drawn = document.createElementNS(drawnIn, 'path')
    drawn.setAttribute('d', line)
    drawn.setAttribute('fill', at < 2 ? 'none' : 'currentColor')
    drawn.setAttribute('stroke', at < 2 ? 'currentColor' : 'none')
    drawn.setAttribute('stroke-width', '1')
    mark.append(drawn)
  })

  return mark
}
