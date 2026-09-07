import type { Part } from '../types/parts'
import type { MarkName } from './marks'
import type { SoundChannel, SoundSettings } from '../types/sound'
import { latchClicks } from '../sound/blows'
import { openTheBox, readSound, setSound, whenSoundChanges } from '../sound/theBox'
import { drawMark } from './marks'
import '../styles/sound.css'

interface Switch {
  channel: SoundChannel
  said: string
  loud: MarkName
  quiet: MarkName
  fallback: number
}

const switches: Switch[] = [
  { channel: 'blows', said: 'Blows and cries', loud: 'horn', quiet: 'hushed', fallback: 0.75 },
  { channel: 'dark', said: 'The dark', loud: 'song', quiet: 'songHushed', fallback: 0.4 }
]

const everythingBack = 0.8

export function hangTheSoundSwitches(): Part {
  const rail = document.createElement('div')
  rail.className = 'soundrail'

  const stopWatching: (() => void)[] = []

  switches.forEach((one) => {
    const key = document.createElement('button')
    key.type = 'button'
    key.className = 'soundhorn'

    let remembered = one.fallback

    function showState(): void {
      const heard = readSound()
      const hushed = heard.everything <= 0 || heard[one.channel] <= 0

      if (heard[one.channel] > 0) {
        remembered = heard[one.channel]
      }

      key.replaceChildren(drawMark({ name: hushed ? one.quiet : one.loud, size: 16 }))
      key.classList.toggle('soundhorn--hushed', hushed)
      key.title = `${one.said}: ${hushed ? 'off' : 'on'}`
      key.setAttribute('aria-label', key.title)
      key.setAttribute('aria-pressed', String(!hushed))
    }

    showState()
    stopWatching.push(whenSoundChanges(showState))

    key.addEventListener('click', () => {
      openTheBox()

      const heard = readSound()
      const hushed = heard.everything <= 0 || heard[one.channel] <= 0
      const next: Partial<SoundSettings> = {}

      if (hushed) {
        next[one.channel] = remembered > 0 ? remembered : one.fallback

        if (heard.everything <= 0) {
          next.everything = everythingBack
        }
      } else {
        remembered = heard[one.channel]
        next[one.channel] = 0
      }

      setSound(next)

      if (hushed) {
        latchClicks()
      }
    })

    rail.append(key)
  })

  return {
    element: rail,

    teardown(): void {
      stopWatching.forEach((stop) => stop())
      rail.remove()
    }
  }
}
