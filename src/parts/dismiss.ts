export interface Dismissal {
  watch(): void
  restAgain(): void
  teardown(): void
}

export function closeWhenAsked(
  panel: HTMLElement,
  opener: HTMLElement,
  close: () => void
): Dismissal {
  let watching = false

  function awayFromBoth(event: PointerEvent): void {
    const at = event.target as Node | null

    if (!at || panel.contains(at) || opener.contains(at)) {
      return
    }

    close()
  }

  function onEscape(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      close()
    }
  }

  function restAgain(): void {
    if (!watching) {
      return
    }
    watching = false
    document.removeEventListener('pointerdown', awayFromBoth, true)
    document.removeEventListener('keydown', onEscape)
    window.removeEventListener('resize', close)
    window.removeEventListener('scroll', close, true)
  }

  function watch(): void {
    if (watching) {
      return
    }
    watching = true
    document.addEventListener('pointerdown', awayFromBoth, true)
    document.addEventListener('keydown', onEscape)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
  }

  return {
    watch,
    restAgain,

    teardown(): void {
      restAgain()
    }
  }
}
