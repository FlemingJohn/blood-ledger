let waitingForATouch = false

export function goFullSight(): void {
  const page = document.documentElement

  if (document.fullscreenElement || typeof page.requestFullscreen !== 'function') {
    return
  }

  page.requestFullscreen().catch(() => {
    if (waitingForATouch) {
      return
    }

    waitingForATouch = true

    document.addEventListener(
      'pointerdown',
      () => {
        waitingForATouch = false
        goFullSight()
      },
      { once: true }
    )
  })
}

export function leaveFullSight(): void {
  if (!document.fullscreenElement) {
    return
  }

  void document.exitFullscreen().catch(() => undefined)
}
