import type { Deed, PatronRecord, Profile, RaiderRecord } from '../types/profile'
import type { ProfilePart } from '../types/parts'
import { countCoins, shortAddress, signedCoins } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { paintBust } from '../art/championPaint'
import { champions } from '../art/champions'
import { gradeFloors } from '../chain/theLedger'
import { drawMark } from './marks'
import '../styles/profile.css'

const highestScore = 1000

function statBar(said: string, worth: string, filled: number, tone: string): HTMLElement {
  const stat = document.createElement('div')
  stat.className = 'profile__stat'

  const top = document.createElement('div')
  top.className = 'profile__statTop'

  const name = document.createElement('span')
  name.textContent = said

  const counted = document.createElement('b')
  counted.className = `profile__statCount profile__statCount--${tone}`
  counted.textContent = worth

  top.append(name, counted)

  const track = document.createElement('div')
  track.className = 'meter profile__statBar'

  const run = document.createElement('div')
  run.className = `meter__filled meter__filled--${tone}`
  run.style.width = `${Math.max(3, Math.min(100, filled))}%`
  track.append(run)

  stat.append(top, track)
  return stat
}

function share(worth: number, most: number): number {
  return most <= 0 ? 0 : (worth / most) * 100
}

function raiderColumn(record: RaiderRecord): HTMLElement {
  const column = document.createElement('div')
  column.className = 'profile__column'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.append(drawMark({ name: 'blade', size: 11 }))
  label.append(document.createTextNode(' As Raider'))

  column.append(
    label,
    statBar('deepest floor', `${record.deepestFloor} / 9`, share(record.deepestFloor, 9), 'good'),
    statBar('best haul', countCoins(record.bestHaul), share(record.bestHaul, 2500), 'good'),
    statBar('coin kept', countCoins(record.coinKept), share(record.coinKept, 6800), 'good'),
    statBar('defaults', String(record.defaults), share(record.defaults, 9), record.defaults > 0 ? 'bad' : 'good')
  )

  return column
}

function patronColumn(record: PatronRecord): HTMLElement {
  const column = document.createElement('div')
  column.className = 'profile__column'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.append(drawMark({ name: 'scales', size: 11 }))
  label.append(document.createTextNode(' As Patron'))

  const backed = Math.max(1, record.backed)

  column.append(
    label,
    statBar('raiders backed', String(record.backed), share(record.backed, 10), 'good'),
    statBar('returned alive', String(record.returned), share(record.returned, backed), 'good'),
    statBar('lost', String(record.lost), share(record.lost, backed), record.lost > 0 ? 'bad' : 'good'),
    statBar('profit', signedCoins(record.profit), share(Math.abs(record.profit), 2400), record.profit >= 0 ? 'good' : 'bad')
  )

  return column
}

function markFor(deed: Deed): SVGSVGElement {
  if (deed.side === 'patron') {
    return drawMark({ name: 'scales', size: 14 })
  }
  return drawMark({ name: deed.outcome === 'fell' ? 'skull' : 'blade', size: 14 })
}

function nextRungAbove(score: number): { grade: string; from: number } | null {
  return gradeFloors.slice().reverse().find((step) => step.from > score) ?? null
}

function deedLine(deed: Deed): HTMLElement {
  const line = document.createElement('li')
  line.className = `profile__deed profile__deed--${deed.outcome === 'fell' ? 'fell' : 'lived'}`

  const mark = markFor(deed)
  mark.classList.add('profile__deedMark')

  const said = document.createElement('span')
  said.className = 'profile__deedSaid'
  said.textContent =
    deed.side === 'raider'
      ? deed.outcome === 'fell'
        ? `fell on floor ${deed.floorReached}`
        : `walked out of floor ${deed.floorReached}`
      : deed.outcome === 'fell'
        ? `backed ${shortAddress(deed.otherSide)}, they fell`
        : `backed ${shortAddress(deed.otherSide)}, they returned`

  const changed = document.createElement('b')
  changed.className = 'profile__deedCoin'
  changed.textContent = signedCoins(deed.coinChange)

  const when = document.createElement('span')
  when.className = 'profile__deedWhen'
  when.textContent = deed.minutesAgo < 60 ? `${deed.minutesAgo}m ago` : `${Math.round(deed.minutesAgo / 60)}h ago`

  line.append(mark, said, changed, when)
  return line
}

export function openTheProfile(): ProfilePart {
  const shroud = document.createElement('div')
  shroud.className = 'profile'
  shroud.hidden = true

  const slab = document.createElement('section')
  slab.className = 'profile__slab framed'

  const head = document.createElement('header')
  head.className = 'profile__head'

  const sigilSeat = document.createElement('div')
  sigilSeat.className = 'profile__sigil'

  const naming = document.createElement('div')
  naming.className = 'profile__naming'

  const rank = document.createElement('p')
  rank.className = 'profile__rank'

  const who = document.createElement('p')
  who.className = 'profile__who'

  naming.append(rank, who)

  const shut = document.createElement('button')
  shut.type = 'button'
  shut.className = 'profile__shut'
  shut.textContent = 'Close'

  head.append(sigilSeat, naming, shut)

  const bar = document.createElement('div')
  bar.className = 'meter meter--notched'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  bar.append(filled)

  const rungs = document.createElement('div')
  rungs.className = 'meter__rungs'
  rungs.setAttribute('aria-hidden', 'true')
  bar.append(rungs)

  const tally = document.createElement('p')
  tally.className = 'panel__tally profile__tally'

  const columns = document.createElement('div')
  columns.className = 'profile__columns'

  const recentLabel = document.createElement('p')
  recentLabel.className = 'panel__label profile__recentLabel'
  recentLabel.textContent = 'Recent'

  const deeds = document.createElement('ul')
  deeds.className = 'profile__deeds'

  slab.append(head, bar, tally, columns, recentLabel, deeds)
  shroud.append(slab)

  const closing = new Set<() => void>()

  function close(): void {
    shroud.hidden = true
    closing.forEach((listener) => listener())
  }

  shut.addEventListener('click', close)
  shroud.addEventListener('click', (event) => {
    if (event.target === shroud) {
      close()
    }
  })

  return {
    element: shroud,

    showProfile(profile: Profile): void {
      sigilSeat.replaceChildren(paintBust(profile.chosenClass, 62))

      rank.textContent = titleFor(profile.standing.grade)

      const above = nextRungAbove(profile.standing.score)

      const grade = document.createElement('b')
      grade.textContent = profile.standing.grade

      const target = document.createElement('span')
      target.textContent = above
        ? `${profile.standing.score} / ${above.from} to ${above.grade}`
        : `${profile.standing.score} — highest rank held`

      who.replaceChildren(grade, target)

      filled.style.width = `${Math.min(100, (profile.standing.score / highestScore) * 100)}%`

      rungs.replaceChildren()
      gradeFloors
        .slice()
        .reverse()
        .forEach((step) => {
          if (step.from <= 0) {
            return
          }
          const notch = document.createElement('u')
          notch.className =
            profile.standing.score >= step.from ? 'meter__notch meter__notch--past' : 'meter__notch'
          notch.style.left = `${(step.from / highestScore) * 100}%`
          rungs.append(notch)
        })

      const called = document.createElement('span')
      called.textContent = champions[profile.chosenClass].said

      const raids = document.createElement('span')
      raids.textContent = `${profile.standing.raids} raids`

      const repaid = document.createElement('span')
      repaid.className = 'panel__good'
      repaid.textContent = `${profile.standing.repaid} repaid`

      const lost = document.createElement('span')
      lost.className = 'panel__bad'
      lost.textContent = `${profile.standing.lost} lost`

      tally.replaceChildren(called, raids, repaid, lost)

      columns.replaceChildren(raiderColumn(profile.asRaider), patronColumn(profile.asPatron))

      deeds.replaceChildren()
      profile.deeds.forEach((deed) => deeds.append(deedLine(deed)))

      shroud.hidden = false
    },

    closeProfile(): void {
      close()
    },

    whenClosed(listener: () => void): void {
      closing.add(listener)
    },

    teardown(): void {
      closing.clear()
      shroud.remove()
    }
  }
}
