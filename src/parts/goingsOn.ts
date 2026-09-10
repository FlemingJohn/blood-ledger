import type { CoinPutUp, HowItStands } from '../types/board'
import type { Part } from '../types/parts'
import { shortAddress } from '../chain/addresses'
import '../styles/goingsOn.css'

const toneFor: Record<HowItStands, string> = {
  'waiting on the witnesses': 'waiting',
  open: 'open',
  over: 'over',
  'taken back': 'back'
}

const markFor: Record<HowItStands, string> = {
  'waiting on the witnesses': '·',
  open: '+',
  over: '=',
  'taken back': 'x'
}

export interface GoingsOnPart extends Part {
  show(putUps: CoinPutUp[]): void
  showTrouble(said: string): void
}

export function watchWhatIsHappening(): GoingsOnPart {
  const feed = document.createElement('section')
  feed.className = 'goingson'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'What Is Happening Below'

  const rows = document.createElement('ul')
  rows.className = 'goingson__rows'

  const word = document.createElement('p')
  word.className = 'goingson__word'
  word.textContent = 'Reading both chains.'

  feed.append(label, rows, word)

  function howLongAgo(when: number): string {
    const minutes = Math.max(0, Math.round((Date.now() - when) / 60_000))

    if (minutes < 1) {
      return 'just now'
    }
    if (minutes < 60) {
      return `${minutes}m ago`
    }

    const hours = Math.round(minutes / 60)
    return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
  }

  return {
    element: feed,

    show(putUps: CoinPutUp[]): void {
      rows.replaceChildren()

      if (putUps.length === 0) {
        word.hidden = false
        word.textContent = 'Nobody has put up coin yet. Be the first.'
        return
      }

      word.hidden = true

      putUps.slice(0, 5).forEach((putUp) => {
        const row = document.createElement('li')
        row.className = `goingson__row goingson__row--${toneFor[putUp.stands]}`

        const mark = document.createElement('span')
        mark.className = 'goingson__mark'
        mark.textContent = markFor[putUp.stands]

        const patron = document.createElement('span')
        patron.className = 'goingson__patron'
        patron.textContent = shortAddress(putUp.patronAddress)

        const what = document.createElement('span')
        what.className = 'goingson__what'
        what.textContent = `put up ${putUp.coinsStaked} ETH for ${shortAddress(putUp.raiderAddress)}`

        const stands = document.createElement('span')
        stands.className = 'goingson__stands'
        stands.textContent = putUp.stands

        const when = document.createElement('span')
        when.className = 'goingson__when'
        when.textContent = howLongAgo(putUp.stakedAt)

        row.append(mark, patron, what, stands, when)
        rows.append(row)
      })
    },

    showTrouble(said: string): void {
      rows.replaceChildren()
      word.hidden = false
      word.textContent = said
    },

    teardown(): void {
      feed.remove()
    }
  }
}
