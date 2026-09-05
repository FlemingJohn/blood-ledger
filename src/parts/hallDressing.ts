import type { Part } from '../types/parts'
import {
  darkenedEdges,
  scatteredBones,
  scatteredRocks,
  sleepingWatcher,
  stoneFloor
} from '../art/paths'

function makeLayer(className: string): HTMLDivElement {
  const layer = document.createElement('div')
  layer.className = className
  layer.setAttribute('aria-hidden', 'true')
  return layer
}

function makeScatter(path: string, place: string): HTMLImageElement {
  const litter = document.createElement('img')
  litter.className = `scatter ${place}`
  litter.src = path
  litter.alt = ''
  litter.setAttribute('aria-hidden', 'true')
  return litter
}

export function dressTheHall(): Part {
  const dressing = document.createDocumentFragment()

  const floor = makeLayer('floor')
  floor.style.backgroundImage = `url(${stoneFloor})`

  const edges = makeLayer('edges')
  edges.style.backgroundImage = `url(${darkenedEdges})`

  const watcher = document.createElement('img')
  watcher.className = 'watcher'
  watcher.src = sleepingWatcher
  watcher.alt = ''
  watcher.setAttribute('aria-hidden', 'true')

  const bones = makeScatter(scatteredBones, 'scatter--bones')
  const rocks = makeScatter(scatteredRocks, 'scatter--rocks')

  dressing.append(floor, watcher, bones, rocks, edges)

  const holder = document.createElement('div')
  holder.append(dressing)

  return {
    element: holder,
    teardown(): void {
      floor.remove()
      edges.remove()
      watcher.remove()
      bones.remove()
      rocks.remove()
    }
  }
}
