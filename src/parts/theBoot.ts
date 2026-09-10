const liftsAfter = 620
const waitsAtMost = 9000

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

export function liftWhenReady(whatIsComing: Promise<unknown>): void {
  window.setTimeout(liftTheBoot, waitsAtMost)

  void whatIsComing.then(liftTheBoot).catch(liftTheBoot)
}
