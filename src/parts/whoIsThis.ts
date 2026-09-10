import type { Part } from '../types/parts'
import { shortAddress } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import {
  openPactFromTheChain,
  standingFromTheChain,
  timesThisPairHaveDealt
} from '../chain/askTheLedger'
import { drawMark } from './marks'
import '../styles/whoIsThis.css'

const looksLikeAnAddress = /^0x[0-9a-fA-F]{40}$/

export interface WhoIsThisPart extends Part {
  lookUp(raiderAddress: string, patronAddress: string): void
  clear(): void
}

export function readTheRaider(): WhoIsThisPart {
  const card = document.createElement('div')
  card.className = 'whois'
  card.hidden = true

  let asking = 0

  function say(...bits: HTMLElement[]): void {
    card.hidden = false
    card.replaceChildren(...bits)
  }

  function head(mark: 'seal' | 'warning' | 'skull', said: string, tone: string): HTMLElement {
    const row = document.createElement('p')
    row.className = `whois__head whois__head--${tone}`
    row.append(drawMark({ name: mark, size: 13 }))
    row.append(document.createTextNode(` ${said}`))
    return row
  }

  function line(said: string, worth: string, tone?: string): HTMLElement {
    const row = document.createElement('div')
    row.className = 'whois__line'

    const name = document.createElement('span')
    name.textContent = said

    const figure = document.createElement('b')
    figure.textContent = worth

    if (tone) {
      figure.classList.add(tone)
    }

    row.append(name, figure)
    return row
  }

  function note(said: string, tone: string): HTMLElement {
    const row = document.createElement('p')
    row.className = `whois__note whois__note--${tone}`
    row.textContent = said
    return row
  }

  return {
    element: card,

    clear(): void {
      asking += 1
      card.hidden = true
      card.replaceChildren()
    },

    lookUp(raiderAddress: string, patronAddress: string): void {
      asking += 1
      const mine = asking

      if (!looksLikeAnAddress.test(raiderAddress.trim())) {
        card.hidden = true
        return
      }

      if (raiderAddress.trim().toLowerCase() === patronAddress.toLowerCase()) {
        say(head('warning', 'That is you', 'bad'), note('You cannot put up coin for yourself.', 'bad'))
        return
      }

      say(head('seal', 'Reading the ledger', 'quiet'))

      void Promise.all([
        standingFromTheChain(raiderAddress.trim()),
        openPactFromTheChain(raiderAddress.trim()),
        timesThisPairHaveDealt(patronAddress, raiderAddress.trim())
      ]).then(([told, pact, pair]) => {
        if (mine !== asking) {
          return
        }

        if (!told) {
          say(
            head('warning', 'The ledger did not answer', 'bad'),
            note('Creditcoin could not be reached. Nothing is known about this address.', 'bad')
          )
          return
        }

        const bits: HTMLElement[] = []

        if (!told.known) {
          bits.push(head('skull', 'Nobody by that name', 'quiet'))
          bits.push(
            note('Has never been down. No record, no standing. You would be the first to trust them.', 'quiet')
          )
        } else {
          bits.push(head('seal', titleFor(told.standing.grade), 'good'))
          bits.push(line('standing', `${told.standing.grade}  ${told.standing.score}`, 'whois__good'))
          bits.push(line('raids', String(told.standing.raids)))
          bits.push(line('repaid', String(told.standing.repaid), 'whois__good'))
          bits.push(line('lost', String(told.standing.lost), told.standing.lost > 0 ? 'whois__bad' : undefined))
        }

        if (pact && !pact.settled) {
          bits.push(
            note(
              `Already holds a pact from ${shortAddress(pact.patronAddress)}. They must settle it before another.`,
              'bad'
            )
          )
        }

        if (pair && pair.times > 0) {
          bits.push(
            note(
              `You have backed this raider ${pair.times} ${pair.times === 1 ? 'time' : 'times'}. ` +
                (pair.wouldEarn === 0
                  ? 'Another earns them nothing at all.'
                  : `Another earns them ${pair.wouldEarn} standing instead of 28.`),
              'warn'
            )
          )
        }

        say(...bits)
      })
    },

    teardown(): void {
      card.remove()
    }
  }
}
