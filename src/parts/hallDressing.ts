import type { Part } from '../types/parts'
import { darkenedEdges, sleepingWatcher } from '../art/paths'
import { lightTheBackdrop } from './flames'

export function dressTheHall(): Part {
  const holder = document.createElement('div')

  const backdrop = lightTheBackdrop()

  const fallback = document.createElement('div')
  fallback.className = 'backdrop backdrop--still'
  fallback.setAttribute('aria-hidden', 'true')

  const watcher = document.createElement('img')
  watcher.className = 'watcher'
  watcher.src = sleepingWatcher
  watcher.alt = ''
  watcher.setAttribute('aria-hidden', 'true')

  const edges = document.createElement('div')
  edges.className = 'edges'
  edges.setAttribute('aria-hidden', 'true')
  edges.style.backgroundImage = `url(${darkenedEdges})`

  holder.append(backdrop ? backdrop.canvas : fallback, watcher, edges)

  return {
    element: holder,
    teardown(): void {
      backdrop?.stop()
      fallback.remove()
      watcher.remove()
      edges.remove()
    }
  }
}
