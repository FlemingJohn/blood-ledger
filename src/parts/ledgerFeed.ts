import type { LedgerEntry } from '../types/ledger'
import type { Part } from '../types/parts'
import { countCoins, shortAddress, signedCoins } from '../chain/addresses'
import '../styles/ledgerFeed.css'

export function unrollTheLedger(entries: LedgerEntry[]): Part {
  const feed = document.createElement('section')
  feed.className = 'feed'

  const label = document.createElement('p')
  label.className = 'panel__label'
  label.textContent = 'The Ledger'

  const rows = document.createElement('ul')
  rows.className = 'feed__rows'

  entries.forEach((entry) => {
    const fell = entry.outcome === 'fell'

    const row = document.createElement('li')
    row.className = `feed__row feed__row--${fell ? 'fell' : 'lived'}`

    const mark = document.createElement('span')
    mark.className = 'feed__mark'
    mark.textContent = fell ? 'x' : '+'

    const who = document.createElement('span')
    who.className = 'feed__who'
    who.textContent = shortAddress(entry.raiderAddress)

    const what = document.createElement('span')
    what.className = 'feed__what'
    what.textContent = fell
      ? `fell on floor ${entry.floorReached}`
      : `walked out with ${countCoins(entry.coinsCarried)}`

    const patron = document.createElement('span')
    patron.className = 'feed__patron'
    patron.textContent = `patron ${signedCoins(entry.patronChange)}`

    const when = document.createElement('span')
    when.className = 'feed__when'
    when.textContent = `${entry.minutesAgo}m ago`

    row.append(mark, who, what, patron, when)
    rows.append(row)
  })

  feed.append(label, rows)

  return {
    element: feed,
    teardown(): void {
      feed.remove()
    }
  }
}
