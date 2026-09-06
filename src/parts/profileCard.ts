import type { Deed, PatronRecord, Profile, RaiderRecord } from '../types/profile'
import type { ProfilePart } from '../types/parts'
import { countCoins, shortAddress, signedCoins } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { drawMark, drawSigil } from './marks'
import '../styles/profile.css'

const highestScore = 1000

function readingRow(said: string, worth: string, tone: string): HTMLElement {
  const line = document.createElement('p')
  line.className = `profile__row profile__row--${tone}`

  const name = document.createElement('span')
  name.textContent = said

  const counted = document.createElement('b')
  counted.textContent = worth

  line.append(name, counted)
  return line
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
    readingRow('deepest floor', String(record.deepestFloor), 'plain'),
    readingRow('best haul', countCoins(record.bestHaul), 'good'),
    readingRow('coin kept', countCoins(record.coinKept), 'plain'),
    readingRow('defaults', String(record.defaults), record.defaults > 0 ? 'bad' : 'plain')
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

  column.append(
    label,
    readingRow('backed', String(record.backed), 'plain'),
    readingRow('returned', String(record.returned), 'good'),
    readingRow('lost', String(record.lost), record.lost > 0 ? 'bad' : 'plain'),
    readingRow('profit', signedCoins(record.profit), record.profit >= 0 ? 'good' : 'bad')
  )

  return column
}

function deedLine(deed: Deed): HTMLElement {
  const line = document.createElement('li')
  line.className = `profile__deed profile__deed--${deed.outcome === 'fell' ? 'fell' : 'lived'}`

  const mark = document.createElement('span')
  mark.className = 'profile__deedMark'
  mark.textContent = deed.outcome === 'fell' ? 'x' : '+'

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
  bar.className = 'meter'

  const filled = document.createElement('div')
  filled.className = 'meter__filled'
  bar.append(filled)

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
      sigilSeat.replaceChildren(drawSigil({ score: profile.standing.score }))

      rank.textContent = titleFor(profile.standing.grade)
      who.textContent = shortAddress(profile.address)

      filled.style.width = `${Math.min(100, (profile.standing.score / highestScore) * 100)}%`

      const raids = document.createElement('span')
      raids.textContent = `${profile.standing.raids} raids`

      const repaid = document.createElement('span')
      repaid.className = 'panel__good'
      repaid.textContent = `${profile.standing.repaid} repaid`

      const lost = document.createElement('span')
      lost.className = 'panel__bad'
      lost.textContent = `${profile.standing.lost} lost`

      const grade = document.createElement('span')
      grade.className = 'profile__grade'
      grade.textContent = `${profile.standing.grade} ${profile.standing.score}`

      tally.replaceChildren(grade, raids, repaid, lost)

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
