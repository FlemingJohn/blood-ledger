import type { Part } from '../types/parts'
import type { Raider } from '../types/raider'
import { coinMark } from '../art/paths'
import { contractsAreLive } from '../chain/theLedger'
import { countCoins, shortAddress } from '../chain/addresses'
import { homeRealm } from '../chain/realms'

export function hangTheTally(raider: Raider): Part {
  const tally = document.createElement('header')
  tally.className = 'tally'

  const line = document.createElement('div')
  line.className = 'tally__line'

  const mark = document.createElement('span')
  mark.className = 'tally__mark'
  mark.textContent = 'Blood Ledger'

  const facts = document.createElement('div')
  facts.className = 'tally__facts'

  const who = document.createElement('span')
  who.className = 'tally__who'
  who.textContent = shortAddress(raider.address)

  const purse = document.createElement('span')
  purse.className = 'tally__coins'

  const coin = document.createElement('img')
  coin.className = 'tally__coin'
  coin.src = coinMark
  coin.alt = ''
  coin.setAttribute('aria-hidden', 'true')

  const amount = document.createElement('b')
  amount.textContent = `${countCoins(raider.coins)} ${homeRealm.coinSymbol}`

  purse.append(coin, amount)

  const standing = document.createElement('span')
  standing.className = 'tally__standing'
  standing.textContent = `Standing ${raider.standing.grade} ${raider.standing.score}`

  facts.append(who, purse, standing)

  if (!contractsAreLive) {
    const warning = document.createElement('span')
    warning.className = 'tally__rehearsal'
    warning.title = 'Patrons, standing and ledger are worked examples until the contracts are deployed.'
    warning.textContent = 'rehearsal'
    facts.append(warning)
  }

  line.append(mark, facts)
  tally.append(line)

  return {
    element: tally,
    teardown(): void {
      tally.remove()
    }
  }
}
