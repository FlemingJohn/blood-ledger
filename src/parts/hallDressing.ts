import type { Part } from '../types/parts'
import { darkenedEdges, sleepingWatcher, stoneFloor } from '../art/paths'
import { lightTheBackdrop } from './flames'

export type Mood = 'landing' | 'working'

export function dressTheHall(mood: Mood): Part {
  const holder = document.createElement('div')

  const edges = document.createElement('div')
  edges.className = 'edges'
  edges.setAttribute('aria-hidden', 'true')
  edges.style.backgroundImage = `url(${darkenedEdges})`

  if (mood === 'working') {
    const room = document.createElement('div')
    room.className = 'backdrop backdrop--room'
    room.setAttribute('aria-hidden', 'true')
    room.style.backgroundImage = `url(${stoneFloor})`

    holder.append(room, edges)

    return {
      element: holder,
      teardown(): void {
        room.remove()
        edges.remove()
      }
    }
  }

  const backdrop = lightTheBackdrop()

  const fallback = document.createElement('div')
  fallback.className = 'backdrop backdrop--still'
  fallback.setAttribute('aria-hidden', 'true')

  const watcher = document.createElement('img')
  watcher.className = 'watcher'
  watcher.src = sleepingWatcher
  watcher.alt = ''
  watcher.setAttribute('aria-hidden', 'true')

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
