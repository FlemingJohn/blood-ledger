import type { Part } from '../types/parts'
import type { Raider } from '../types/raider'
import { coinMark } from '../art/paths'
import { contractsAreLive } from '../chain/theLedger'
import { countCoins, shortAddress } from '../chain/addresses'
import { titleFor } from '../chain/ranks'
import { homeRealm } from '../chain/realms'
import { drawMark, drawSigil } from './marks'
import '../styles/tally.css'

export interface TallyPart extends Part {
  middleSeat: HTMLElement
}

export function hangTheTally(raider: Raider): TallyPart {
  const tally = document.createElement('header')
  tally.className = 'tally'
  tally.style.position = 'relative'

  const plate = document.createElement('div')
  plate.className = 'tally__plate'

  const corners: ('tl' | 'tr' | 'bl' | 'br')[] = ['tl', 'tr', 'bl', 'br']
  corners.forEach((where) => {
    const piece = drawMark({ name: 'corner', size: 22 })
    piece.classList.add('plate__corner', `plate__corner--${where}`)
    tally.append(piece)
  })

  const sigilSeat = document.createElement('div')
  sigilSeat.className = 'tally__sigil'

  sigilSeat.append(drawSigil({ score: raider.standing.score }))

  const rank = document.createElement('p')
  rank.className = 'tally__rank'
  rank.textContent = titleFor(raider.standing.grade)

  sigilSeat.append(rank)

  const middle = document.createElement('div')
  middle.className = 'tally__middle'

  const wordmark = document.createElement('p')
  wordmark.className = 'tally__wordmark'

  wordmark.append(drawMark({ name: 'blade', size: 17, className: 'mark--blood' }))

  const name = document.createElement('span')
  name.textContent = 'Blood Ledger'
  wordmark.append(name)

  wordmark.append(drawMark({ name: 'blade', size: 17, className: 'mark--blood' }))

  const middleSeat = document.createElement('div')
  middleSeat.className = 'tally__seat'

  middle.append(wordmark, middleSeat)

  const purseSeat = document.createElement('div')
  purseSeat.className = 'tally__purse'

  const socket = document.createElement('div')
  socket.className = 'tally__socket'

  const coin = document.createElement('img')
  coin.className = 'tally__coin'
  coin.src = coinMark
  coin.alt = ''
  coin.setAttribute('aria-hidden', 'true')

  const held = document.createElement('b')
  held.textContent = countCoins(raider.coins)

  const named = document.createElement('span')
  named.className = 'tally__coinName'
  named.textContent = homeRealm.coinSymbol

  socket.append(coin, held, named)

  const who = document.createElement('p')
  who.className = 'tally__who'
  who.textContent = shortAddress(raider.address)

  purseSeat.append(socket, who)

  if (!contractsAreLive) {
    const warned = document.createElement('p')
    warned.className = 'tally__rehearsal'
    warned.title =
      'Patrons, standing and ledger are worked examples until the contracts are deployed.'
    warned.append(drawMark({ name: 'warning', size: 11 }))
    warned.append(document.createTextNode(' rehearsal'))
    purseSeat.append(warned)
  }

  plate.append(sigilSeat, middle, purseSeat)
  tally.append(plate)

  return {
    element: tally,
    middleSeat,
    teardown(): void {
      tally.remove()
    }
  }
}
