import type { Part } from '../types/parts'
import type { Raider, RaiderClass, Standing } from '../types/raider'
import { paintBust } from '../art/championPaint'
import { contractsAreLive, gradeFloors, readTheUnderwriter } from '../chain/theLedger'
import { readTheWitnesses } from '../chain/witnesses'
import { readOutTheUnderwriter } from './underwriterBay'
import { watchTheWitnesses } from './witnessBay'
import { countCoins } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { homeRealm } from '../chain/realms'
import { drawMark } from './marks'
import { hangTheSoundHorn } from './soundHorn'
import { hangTheHousePurse } from './housePurse'
import '../styles/tally.css'

const highestScore = 1000

export interface TallyPart extends Part {
  middleSeat: HTMLElement
  whenNameAsked(listener: () => void): void
  showClass(chosen: RaiderClass): void
  showStanding(standing: Standing): void
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

  const reading = document.createElement('p')
  reading.className = 'tally__reading'

  const grade = document.createElement('b')
  const target = document.createElement('span')

  reading.append(grade, target)

  const bar = document.createElement('div')
  bar.className = 'meter meter--notched tally__bar'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
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

  const repaid = document.createElement('span')
  repaid.className = 'panel__good'

  const lost = document.createElement('span')
  lost.className = 'panel__bad'

  counted.append(raids, repaid, lost)

  function paintStanding(told: Standing): void {
    rank.textContent = titleFor(told.grade)
    grade.textContent = told.grade

    const above = nextRungAbove(told.score)
    target.textContent = above
      ? `${told.score} / ${above.from} to ${above.grade}`
      : `${told.score} — highest rank held`

    filled.style.width = `${Math.min(100, (told.score / highestScore) * 100)}%`
    raids.textContent = `${told.raids} raids`
    repaid.textContent = `${told.repaid} repaid`
    lost.textContent = `${told.lost} lost`

    rungs.querySelectorAll('.meter__notch').forEach((notch, at) => {
      const step = gradeFloors.slice().reverse().filter((one) => one.from > 0)[at]
      notch.className = step && told.score >= step.from ? 'meter__notch meter__notch--past' : 'meter__notch'
    })
  }

  paintStanding(raider.standing)

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

  const realmName = document.createElement('span')
  realmName.className = 'tally__realmName'
  realm.append(realmName)

  if (raider.coins <= 0) {
    realm.classList.add('tally__realm--empty')
    figure.classList.add('tally__coins--empty')
    realmName.textContent = `${homeRealm.shortName} · empty`
  } else if (contractsAreLive) {
    realmName.textContent = homeRealm.name
  } else {
    realm.classList.add('tally__realm--warned')
    realmName.append(drawMark({ name: 'warning', size: 10 }))
    realmName.append(document.createTextNode(` ${homeRealm.shortName} · rehearsal`))
  }

  realmName.title = realmName.textContent ?? ''

  const horn = hangTheSoundHorn()
  const houseCall = hangTheHousePurse(raider.address)

  realm.append(horn.element, houseCall.element)
  purseBay.append(socket, realm)

  plate.append(faceBay, standingBay, underwriter.element, witnesses.element, roleBay, purseBay)
  tally.append(plate)

  let showing = raider.chosenClass

  function showBust(): void {
    frame.replaceChildren(paintBust(showing, 66))
  }

  showBust()

  return {
    element: tally,
    middleSeat,

    showStanding(told: Standing): void {
      paintStanding(told)
    },

    showClass(chosen: RaiderClass): void {
      if (chosen === showing) {
        return
      }
      showing = chosen
      showBust()
    },

    whenNameAsked(listener: () => void): void {
      asking.add(listener)
    },

    teardown(): void {
      houseCall.teardown()
      horn.teardown()
      stillWatching = false
      window.clearInterval(witnessBeat)
      witnesses.teardown()
      underwriter.teardown()
      asking.clear()
      tally.remove()
    }
  }
}
