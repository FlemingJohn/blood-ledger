import type { WitnessReading } from '../types/witnesses'
import type { Part } from '../types/parts'
import { drawMark } from './marks'
import '../styles/bays.css'

const caughtUpWithin = 3
const worstLagShown = 120

export interface WitnessBayPart extends Part {
  showWitnesses(reading: WitnessReading): void
}

export function watchTheWitnesses(): WitnessBayPart {
  const bay = document.createElement('div')
  bay.className = 'tally__bay bay--reading bay--witnesses'

  const label = document.createElement('p')
  label.className = 'bay__label'

  const named = document.createElement('span')
  named.className = 'bay__named'
  named.textContent = 'The Witnesses'

  const counted = document.createElement('span')
  counted.className = 'bay__aside'

  label.append(named, counted)

  const paying = document.createElement('p')
  paying.className = 'bay__row'

  const track = document.createElement('div')
  track.className = 'bay__track'

  const run = document.createElement('div')
  run.className = 'bay__run bay__run--wary'
  track.append(run)

  const said = document.createElement('p')
  said.className = 'bay__aside bay__aside--wide'

  const second = document.createElement('p')
  second.className = 'bay__row bay__row--dim'

  bay.append(label, paying, track, said, second)

  function showChain(name: string, height: string, tone: string): void {
    const who = document.createElement('span')
    who.className = 'bay__named'
    who.append(drawMark({ name: 'scales', size: 11 }))
    who.append(document.createTextNode(` ${name}`))

    const tall = document.createElement('b')
    tall.className = `bay__count bay__count--${tone}`
    tall.textContent = height

    paying.replaceChildren(who, tall)
  }

  return {
    element: bay,

    showWitnesses(reading: WitnessReading): void {
      if (!reading.reachable || !reading.paying) {
        counted.textContent = ''
        showChain('the chain', '——', 'grim')
        track.hidden = true
        said.className = 'bay__aside bay__aside--wide bay__aside--grim'
        said.textContent = 'the witnesses did not answer'
        second.replaceChildren()
        return
      }

      counted.textContent = `${reading.chains.length} chains`
      track.hidden = false

      const behind = reading.blocksBehind
      const caughtUp = behind !== null && behind <= caughtUpWithin

      showChain(reading.paying.name, reading.paying.height.toLocaleString('en-US'), caughtUp ? 'kind' : 'plain')

      if (behind === null) {
        run.style.width = '100%'
        run.className = 'bay__run bay__run--wary'
        said.className = 'bay__aside bay__aside--wide'
        said.textContent = 'attested'
      } else {
        const short = Math.max(0, 1 - behind / worstLagShown)
        run.style.width = `${Math.max(4, Math.round(short * 100))}%`
        run.className = `bay__run bay__run--${caughtUp ? 'kind' : 'wary'}`
        said.className = `bay__aside bay__aside--wide${caughtUp ? ' bay__aside--kind' : ''}`
        said.textContent = caughtUp
          ? 'caught up · proves at once'
          : `${behind} behind · proves in ~${reading.minutesBehind} min`
      }

      const others = reading.chains.filter((one) => one.chainKey !== reading.paying?.chainKey)

      if (others.length === 0) {
        second.replaceChildren()
        return
      }

      const other = others[0]
      if (!other) {
        return
      }

      const who = document.createElement('span')
      who.textContent = other.name

      const tall = document.createElement('span')
      tall.textContent = `${other.height.toLocaleString('en-US')} attested`

      second.replaceChildren(who, tall)
    },

    teardown(): void {
      bay.remove()
    }
  }
}
