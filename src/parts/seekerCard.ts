import type { Part } from '../types/parts'
import type { Raider } from '../types/raider'
import { drawMark } from './marks'
import { shortAddress } from '../chain/addresses'
import '../styles/patron.css'

export interface SeekerCardPart extends Part {
  whenBacked(listener: (raider: Raider) => void): void
}

export function layOutSeeker(
  raider: Raider,
  note: string | null,
  isYou: boolean
): SeekerCardPart {
  const card = document.createElement('article')
  card.className = `seeker framed${isYou ? ' seeker--yourself' : ''}`

  const line = document.createElement('div')
  line.className = 'seeker__line'

  const who = document.createElement('span')
  who.className = 'seeker__who'
  who.textContent = shortAddress(raider.address)

  const grade = document.createElement('span')
  grade.className = 'seeker__grade'
  grade.textContent = `${raider.standing.grade} ${raider.standing.score}`

  line.append(who, grade)

  if (isYou) {
    const yourself = document.createElement('span')
    yourself.className = 'seeker__yourself'
    yourself.textContent = 'that is you'
    line.append(yourself)
  } else {
    const back = document.createElement('button')
    back.type = 'button'
    back.className = 'seeker__back'
    back.append(drawMark({ name: 'coin', size: 14 }))

    const backWord = document.createElement('span')
    backWord.textContent = 'Back This One'
    back.append(backWord)

    line.append(back)

    back.addEventListener('click', () => {
      listeners.forEach((listener) => listener(raider))
    })
  }

  const tally = document.createElement('p')
  tally.className = 'seeker__tally'

  const raids = document.createElement('span')
  raids.textContent = `${raider.standing.raids} raids`

  const repaid = document.createElement('span')
  repaid.className = 'panel__good'
  repaid.textContent = `${raider.standing.repaid} repaid`

  const lost = document.createElement('span')
  lost.className = 'panel__bad'
  lost.append(drawMark({ name: 'skull', size: 12 }))
  lost.append(document.createTextNode(` ${raider.standing.lost} lost`))

  tally.append(raids, repaid, lost)
  card.append(line, tally)

  if (note) {
    const warned = document.createElement('p')
    warned.className = 'seeker__warned'
    warned.append(drawMark({ name: 'warning', size: 13 }))
    warned.append(document.createTextNode(` ${note}`))
    card.append(warned)
  }

  const listeners = new Set<(raider: Raider) => void>()

  return {
    element: card,

    whenBacked(listener: (raider: Raider) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      card.remove()
    }
  }
}
