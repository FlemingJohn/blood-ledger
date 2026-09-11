import { driver, type Driver } from 'driver.js'
import type { TourPart, TourStep } from '../types/tour'
import { drawMark } from './marks'
import { latchClicks } from '../sound/blows'
import 'driver.js/dist/driver.css'
import '../styles/tour.css'

const dimmedTo = 'rgba(3, 1, 1, 0.82)'
const roomAround = 6

function headed(step: TourStep, place: number, howMany: number): string {
  const head = document.createElement('span')
  head.className = 'tour__head'
  head.append(drawMark({ name: step.mark, size: 13, className: 'tour__mark' }))

  const named = document.createElement('span')
  named.textContent = step.title
  head.append(named)

  if (howMany > 1) {
    const counted = document.createElement('b')
    counted.className = 'tour__counted'
    counted.textContent = `${place + 1} of ${howMany}`
    head.append(counted)
  }

  return head.outerHTML
}

export function guideTheWay(): TourPart {
  let guide: Driver | null = null
  let onFoot = false
  const listeners = new Set<() => void>()

  function finish(): void {
    if (!onFoot) {
      return
    }
    onFoot = false
    guide = null
    listeners.forEach((listener) => listener())
  }

  return {
    walking(): boolean {
      return onFoot
    },

    walk(steps: TourStep[]): void {
      if (onFoot) {
        return
      }

      const standing = steps.filter((step) =>
        typeof step.at === 'string' ? document.querySelector(step.at) !== null : true
      )

      if (standing.length === 0) {
        listeners.forEach((listener) => listener())
        return
      }

      onFoot = true

      guide = driver({
        overlayColor: dimmedTo,
        stagePadding: roomAround,
        stageRadius: 8,
        popoverClass: 'tour',
        showProgress: false,
        allowClose: true,
        overlayClickBehavior: 'close',
        nextBtnText: 'Next',
        prevBtnText: 'Back',
        doneBtnText: 'Got it',
        onPopoverRender: () => latchClicks(),
        onDestroyed: finish,
        steps: standing.map((step, place) => ({
          element: step.at,
          onHighlightStarted: () => step.before?.(),
          popover: {
            title: headed(step, place, standing.length),
            description: step.said,
            side: step.side ?? 'bottom',
            align: step.align ?? 'center'
          }
        }))
      })

      guide.drive()
    },

    stop(): void {
      guide?.destroy()
      finish()
    },

    whenDone(listener: () => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      guide?.destroy()
      listeners.clear()
      onFoot = false
      guide = null
    }
  }
}
