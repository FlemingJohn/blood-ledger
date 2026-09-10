const liftsAfter = 620
const waitsAtMost = 22000

let lifted = false

function findIt(): HTMLElement | null {
  return document.getElementById('boot')
}

export function sayWhileBooting(what: string): void {
  const said = findIt()?.querySelector('.boot__said')

  if (said) {
    said.textContent = what
  }
}

export function liftTheBoot(): void {
  if (lifted) {
    return
  }

  lifted = true

  const boot = findIt()

  if (!boot) {
    return
  }

  boot.classList.add('boot--lifting')
  window.setTimeout(() => boot.remove(), liftsAfter)
}

const stillWaitingOn = new Set<string>()
let started = false

export function holdTheBootFor(what: string): void {
  if (lifted) {
    return
  }
  stillWaitingOn.add(what)
}

export function doneWaitingOn(what: string): void {
  stillWaitingOn.delete(what)

  if (started && stillWaitingOn.size === 0) {
    liftTheBoot()
  }
}

export function liftWhenNothingIsLeft(): void {
  started = true
  window.setTimeout(liftTheBoot, waitsAtMost)

  if (stillWaitingOn.size === 0) {
    liftTheBoot()
  }
}
