import type { Part } from '../types/parts'
import type { SoundSettings } from '../types/sound'
import { bladeLands } from '../sound/blows'
import { openTheBox, readSound, setSound } from '../sound/theBox'
import '../styles/sound.css'

type Knob = keyof SoundSettings

const knobs: { knob: Knob; said: string; aside: string }[] = [
  { knob: 'everything', said: 'Everything', aside: 'all of it' },
  { knob: 'blows', said: 'Blows and cries', aside: 'the fighting' },
  { knob: 'dark', said: 'The dark', aside: 'the music' }
]

export interface SoundSlipPart extends Part {
  open(near: HTMLElement): void
  close(): void
  isOpen(): boolean
}

export function hangTheSoundSlip(): SoundSlipPart {
  const slip = document.createElement('div')
  slip.className = 'soundslip framed'
  slip.hidden = true

  const head = document.createElement('div')
  head.className = 'soundslip__head'

  const title = document.createElement('p')
  title.className = 'soundslip__title'
  title.textContent = 'Sound'

  const shut = document.createElement('button')
  shut.type = 'button'
  shut.className = 'soundslip__shut'
  shut.textContent = 'Close'
  shut.setAttribute('aria-label', 'close the sound panel')

  head.append(title, shut)

  const rows = document.createElement('div')
  rows.className = 'soundslip__rows'

  const held = readSound()

  knobs.forEach((one) => {
    const row = document.createElement('label')
    row.className = 'soundslip__row'

    const said = document.createElement('span')
    said.className = 'soundslip__said'
    said.textContent = one.said

    const slider = document.createElement('input')
    slider.type = 'range'
    slider.min = '0'
    slider.max = '100'
    slider.step = '5'
    slider.value = String(Math.round(held[one.knob] * 100))
    slider.className = 'soundslip__slider'
    slider.setAttribute('aria-label', `${one.said}, ${one.aside}`)

    const counted = document.createElement('b')
    counted.className = 'soundslip__counted'
    counted.textContent = `${slider.value}%`

    slider.addEventListener('input', () => {
      const worth = Number(slider.value) / 100
      counted.textContent = `${slider.value}%`
      openTheBox()
      setSound({ [one.knob]: worth } as Partial<SoundSettings>)
    })

    slider.addEventListener('change', () => {
      if (one.knob !== 'dark' && Number(slider.value) > 0) {
        bladeLands()
      }
    })

    row.append(said, slider, counted)
    rows.append(row)
  })

  const aside = document.createElement('p')
  aside.className = 'soundslip__aside'
  aside.textContent = 'Remembered on this machine.'

  slip.append(head, rows, aside)

  function close(): void {
    slip.hidden = true
  }

  shut.addEventListener('click', close)

  return {
    element: slip,

    open(near: HTMLElement): void {
      openTheBox()
      slip.hidden = false

      const box = near.getBoundingClientRect()
      const wide = slip.offsetWidth
      const tall = slip.offsetHeight
      const across = document.documentElement.clientWidth
      const down = document.documentElement.clientHeight

      const below = box.bottom + 8
      const above = box.top - 8 - tall
      const top = below + tall <= down - 8 || above < 8 ? below : above

      slip.style.top = `${Math.round(Math.min(Math.max(8, top), Math.max(8, down - tall - 8)))}px`
      slip.style.left = `${Math.round(Math.min(Math.max(8, box.right - wide), Math.max(8, across - wide - 8)))}px`
    },

    close,

    isOpen(): boolean {
      return !slip.hidden
    },

    teardown(): void {
      slip.remove()
    }
  }
}
