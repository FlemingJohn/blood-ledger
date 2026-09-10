import type { BeenDown } from '../types/board'
import type { Part } from '../types/parts'
import { drawMark } from './marks'
import { shortAddress } from '../chain/addresses'
import { drawCrest } from './hallMarks'
import { coinPoured } from '../sound/blows'
import '../styles/patron.css'

export interface SeekerCardPart extends Part {
  whenBacked(listener: (who: BeenDown) => void): void
}

export function layOutSeeker(who: BeenDown, isYou: boolean): SeekerCardPart {
  const card = document.createElement('article')
  card.className = `seeker framed${isYou ? ' seeker--yourself' : ''}`

  const line = document.createElement('div')
  line.className = 'seeker__line'

  const naming = document.createElement('span')
  naming.className = 'seeker__who'

  const crest = drawCrest(who.address, 17)
  crest.classList.add('seeker__crest')
  naming.append(crest)

  const named = document.createElement('span')
  named.textContent = shortAddress(who.address)
  naming.append(named)

  const grade = document.createElement('span')
  grade.className = 'seeker__grade'
  grade.textContent = `${who.standing.grade} ${who.standing.score}`

  line.append(naming, grade)

  const listeners = new Set<(who: BeenDown) => void>()

  if (isYou) {
    const yourself = document.createElement('span')
    yourself.className = 'seeker__yourself'
    yourself.textContent = 'that is you'
    line.append(yourself)
  } else if (who.holdsAPact) {
    const owing = document.createElement('span')
    owing.className = 'seeker__yourself'
    owing.textContent = 'already owes'
    line.append(owing)
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
      coinPoured()
      listeners.forEach((listener) => listener(who))
    })
  }

  const tally = document.createElement('p')
  tally.className = 'seeker__tally'

  const raids = document.createElement('span')
  raids.textContent = `${who.standing.raids} raids`

  const repaid = document.createElement('span')
  repaid.className = 'panel__good'
  repaid.textContent = `${who.standing.repaid} repaid`

  const lost = document.createElement('span')
  lost.className = 'panel__bad'
  lost.append(drawMark({ name: 'skull', size: 12 }))
  lost.append(document.createTextNode(` ${who.standing.lost} lost`))

  tally.append(raids, repaid, lost)
  card.append(line, tally)

  if (who.note) {
    const warned = document.createElement('p')
    warned.className = 'seeker__warned'
    warned.append(drawMark({ name: 'warning', size: 13 }))
    warned.append(document.createTextNode(` ${who.note}`))
    card.append(warned)
  }

  return {
    element: card,

    whenBacked(listener: (who: BeenDown) => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      card.remove()
    }
  }
}
