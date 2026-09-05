import type { Part } from '../types/parts'
import { darkenedEdges, sleepingWatcher } from '../art/paths'
import { lightTheBackdrop } from './flames'

export type Mood = 'landing' | 'working'

export function dressTheHall(mood: Mood): Part {
  const holder = document.createElement('div')

  const backdrop = lightTheBackdrop()

  const fallback = document.createElement('div')
  fallback.className = 'backdrop backdrop--still'
  fallback.setAttribute('aria-hidden', 'true')

  const behind = backdrop ? backdrop.canvas : fallback
  if (mood === 'working') {
    behind.classList.add('backdrop--dimmed')
  }

  const edges = document.createElement('div')
  edges.className = 'edges'
  edges.setAttribute('aria-hidden', 'true')
  edges.style.backgroundImage = `url(${darkenedEdges})`

  const watcher = document.createElement('img')
  watcher.className = 'watcher'
  watcher.src = sleepingWatcher
  watcher.alt = ''
  watcher.setAttribute('aria-hidden', 'true')

  if (mood === 'landing') {
    holder.append(behind, watcher, edges)
  } else {
    holder.append(behind, edges)
  }

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
