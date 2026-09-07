import type { Part } from '../types/parts'
import type { Raider } from '../types/raider'
import { paintBust } from '../art/championPaint'
import { contractsAreLive, gradeFloors, readTheUnderwriter } from '../chain/theLedger'
import { readTheWitnesses } from '../chain/witnesses'
import { readOutTheUnderwriter } from './underwriterBay'
import { watchTheWitnesses } from './witnessBay'
import { countCoins } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { homeRealm } from '../chain/realms'
import { drawMark } from './marks'
import { hangTheSoundSlip } from './soundSlip'
import { readSound, whenSoundChanges } from '../sound/theBox'
import '../styles/tally.css'

const highestScore = 1000

export interface TallyPart extends Part {
  middleSeat: HTMLElement
  whenNameAsked(listener: () => void): void
  showBust(): void
}

function nextRungAbove(score: number): { grade: string; from: number } | null {
  const climbing = gradeFloors.slice().reverse()
  return climbing.find((step) => step.from > score) ?? null
}

export function hangTheTally(raider: Raider): TallyPart {
  const tally = document.createElement('header')
  tally.className = 'tally'

  const plate = document.createElement('div')
  plate.className = 'tally__plate'

  const faceBay = document.createElement('button')
  faceBay.type = 'button'
  faceBay.className = 'tally__bay tally__bay--face'
  faceBay.title = 'Open your record'

  const frame = document.createElement('span')
  frame.className = 'bust'
  faceBay.append(frame)

  const asking = new Set<() => void>()
  faceBay.addEventListener('click', () => asking.forEach((listener) => listener()))

  const standingBay = document.createElement('div')
  standingBay.className = 'tally__bay tally__bay--standing'

  const rank = document.createElement('p')
  rank.className = 'tally__rank'
  rank.textContent = titleFor(raider.standing.grade)

  const reading = document.createElement('p')
  reading.className = 'tally__reading'

  const grade = document.createElement('b')
  grade.textContent = raider.standing.grade

  const target = document.createElement('span')
  const above = nextRungAbove(raider.standing.score)
  target.textContent = above
    ? `${raider.standing.score} / ${above.from} to ${above.grade}`
    : `${raider.standing.score} — highest rank held`

  reading.append(grade, target)

  const bar = document.createElement('div')
  bar.className = 'meter meter--notched tally__bar'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  filled.style.width = `${Math.min(100, (raider.standing.score / highestScore) * 100)}%`
  bar.append(filled)

  const rungs = document.createElement('div')
  rungs.className = 'meter__rungs'
  rungs.setAttribute('aria-hidden', 'true')

  gradeFloors
    .slice()
    .reverse()
    .forEach((step) => {
      if (step.from <= 0) {
        return
      }
      const notch = document.createElement('u')
      notch.className = raider.standing.score >= step.from ? 'meter__notch meter__notch--past' : 'meter__notch'
      notch.style.left = `${(step.from / highestScore) * 100}%`
      rungs.append(notch)
    })

  bar.append(rungs)

  const counted = document.createElement('p')
  counted.className = 'tally__counted'

  const raids = document.createElement('span')
  raids.textContent = `${raider.standing.raids} raids`

  const repaid = document.createElement('span')
  repaid.className = 'panel__good'
  repaid.textContent = `${raider.standing.repaid} repaid`

  const lost = document.createElement('span')
  lost.className = 'panel__bad'
  lost.textContent = `${raider.standing.lost} lost`

  counted.append(raids, repaid, lost)

  standingBay.append(rank, reading, bar, counted)

  const underwriter = readOutTheUnderwriter(readTheUnderwriter(raider))

  const witnesses = watchTheWitnesses()
  witnesses.showWitnesses({
    chains: [],
    paying: null,
    blocksBehind: null,
    minutesBehind: null,
    reachable: false
  })

  let stillWatching = true

  function askTheWitnesses(): void {
    void readTheWitnesses().then((reading) => {
      if (stillWatching) {
        witnesses.showWitnesses(reading)
      }
    })
  }

  askTheWitnesses()
  const witnessBeat = window.setInterval(askTheWitnesses, 30000)

  const roleBay = document.createElement('div')
  roleBay.className = 'tally__bay tally__bay--role'

  const middleSeat = document.createElement('div')
  middleSeat.className = 'tally__seat'
  roleBay.append(middleSeat)

  const purseBay = document.createElement('div')
  purseBay.className = 'tally__bay tally__bay--purse'

  if (!contractsAreLive) {
    purseBay.classList.add('tally__bay--warned')
  }

  const socket = document.createElement('div')
  socket.className = 'tally__socket'

  const slot = document.createElement('span')
  slot.className = 'tally__slot'
  slot.append(drawMark({ name: 'coin', size: 14, className: 'mark--gold' }))

  const held = document.createElement('p')
  held.className = 'tally__coins'

  const figure = document.createElement('span')
  figure.textContent = countCoins(raider.coins)

  const named = document.createElement('span')
  named.className = 'tally__coinName'
  named.textContent = homeRealm.coinSymbol

  held.append(figure, named)
  socket.append(slot, held)

  const realm = document.createElement('p')
  realm.className = 'tally__realm'

  if (raider.coins <= 0) {
    realm.classList.add('tally__realm--empty')
    figure.classList.add('tally__coins--empty')
    realm.textContent = `${homeRealm.shortName} · faucet →`
  } else if (contractsAreLive) {
    realm.textContent = homeRealm.name
  } else {
    realm.classList.add('tally__realm--warned')
    realm.append(drawMark({ name: 'warning', size: 10 }))
    realm.append(document.createTextNode(` ${homeRealm.shortName} · rehearsal`))
  }

  const slip = hangTheSoundSlip()

  const speaker = document.createElement('button')
  speaker.type = 'button'
  speaker.className = 'tally__speaker'
  speaker.title = 'Sound'
  speaker.setAttribute('aria-label', 'sound settings')
  speaker.append(drawMark({ name: 'seal', size: 12 }))

  function showHushed(): void {
    const heard = readSound()
    const hushed = heard.everything <= 0 || (heard.blows <= 0 && heard.dark <= 0)
    speaker.classList.toggle('tally__speaker--hushed', hushed)
  }

  showHushed()
  const stopWatchingSound = whenSoundChanges(showHushed)

  speaker.addEventListener('click', () => {
    if (slip.isOpen()) {
      slip.close()
      return
    }
    slip.open(speaker)
  })

  realm.append(speaker)
  purseBay.append(socket, realm)
  document.body.append(slip.element)

  plate.append(faceBay, standingBay, underwriter.element, witnesses.element, roleBay, purseBay)
  tally.append(plate)

  function showBust(): void {
    frame.replaceChildren(paintBust(raider.chosenClass, 66))
  }

  showBust()

  return {
    element: tally,
    middleSeat,
    showBust,

    whenNameAsked(listener: () => void): void {
      asking.add(listener)
    },

    teardown(): void {
      stopWatchingSound()
      slip.teardown()
      stillWatching = false
      window.clearInterval(witnessBeat)
      witnesses.teardown()
      underwriter.teardown()
      asking.clear()
      tally.remove()
    }
  }
}
