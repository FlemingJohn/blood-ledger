import type { WhatYouWant } from './world'

const walkKeys: Record<string, { alongX: number; alongY: number }> = {
  KeyW: { alongX: 0, alongY: -1 },
  ArrowUp: { alongX: 0, alongY: -1 },
  KeyS: { alongX: 0, alongY: 1 },
  ArrowDown: { alongX: 0, alongY: 1 },
  KeyA: { alongX: -1, alongY: 0 },
  ArrowLeft: { alongX: -1, alongY: 0 },
  KeyD: { alongX: 1, alongY: 0 },
  ArrowRight: { alongX: 1, alongY: 0 }
}

export interface Wanted extends WhatYouWant {
  firstPower: boolean
  secondPower: boolean
}

export interface Hands {
  read(): Wanted
  letGo(): void
}

export function takeTheHands(watching: HTMLElement): Hands {
  const held = new Set<string>()
  let swinging = false
  let firstPower = false
  let secondPower = false

  function keyDown(event: KeyboardEvent): void {
    if (walkKeys[event.code]) {
      held.add(event.code)
      event.preventDefault()
    }
    if (event.code === 'Space') {
      swinging = true
      event.preventDefault()
    }
    if (event.code === 'KeyQ' || event.code === 'Digit1') {
      firstPower = true
      event.preventDefault()
    }
    if (event.code === 'KeyE' || event.code === 'Digit2') {
      secondPower = true
      event.preventDefault()
    }
  }

  function keyUp(event: KeyboardEvent): void {
    held.delete(event.code)
  }

  function pressed(event: MouseEvent): void {
    if (event.button === 0) {
      swinging = true
    }
    if (event.button === 2) {
      firstPower = true
    }
  }

  function noMenu(event: Event): void {
    event.preventDefault()
  }

  function lostFocus(): void {
    held.clear()
  }

  window.addEventListener('keydown', keyDown)
  window.addEventListener('keyup', keyUp)
  window.addEventListener('blur', lostFocus)
  watching.addEventListener('mousedown', pressed)
  watching.addEventListener('contextmenu', noMenu)

  return {
    read(): Wanted {
      let alongX = 0
      let alongY = 0

      held.forEach((code) => {
        const way = walkKeys[code]
        if (way) {
          alongX += way.alongX
          alongY += way.alongY
        }
      })

      const wanted = { alongX, alongY, swinging, firstPower, secondPower }
      swinging = false
      firstPower = false
      secondPower = false
      return wanted
    },

    letGo(): void {
      held.clear()
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      window.removeEventListener('blur', lostFocus)
      watching.removeEventListener('mousedown', pressed)
      watching.removeEventListener('contextmenu', noMenu)
    }
  }
}
