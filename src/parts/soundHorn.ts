import type { Part } from '../types/parts'
import { hangTheSoundSlip } from './soundSlip'
import { latchClicks } from '../sound/blows'
import { readSound, whenSoundChanges } from '../sound/theBox'
import { drawMark } from './marks'
import '../styles/sound.css'

export function hangTheSoundHorn(): Part {
  const horn = document.createElement('button')
  horn.type = 'button'
  horn.className = 'soundhorn'
  horn.title = 'Sound'
  horn.setAttribute('aria-label', 'sound settings')

  const slip = hangTheSoundSlip()
  document.body.append(slip.element)

  function showState(): void {
    const heard = readSound()
    const hushed = heard.everything <= 0 || (heard.blows <= 0 && heard.dark <= 0)

    horn.replaceChildren(drawMark({ name: hushed ? 'hushed' : 'horn', size: 16 }))
    horn.classList.toggle('soundhorn--hushed', hushed)
  }

  showState()
  const stopWatching = whenSoundChanges(showState)

  horn.addEventListener('click', () => {
    if (slip.isOpen()) {
      slip.close()
      return
    }
    slip.open(horn)
    latchClicks()
  })

  return {
    element: horn,
    teardown(): void {
      stopWatching()
      slip.teardown()
      horn.remove()
    }
  }
}
