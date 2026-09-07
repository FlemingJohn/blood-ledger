import type { Part } from '../types/parts'
import type { HandedOver, HouseReading } from '../types/house'
import { askForAPurse, askTheHouse, theHouseAnswered } from '../chain/house'
import { coinPoured, doorWontBudge, latchClicks } from '../sound/blows'
import { drawMark } from './marks'
import '../styles/house.css'

function countCoin(coins: string): string {
  const worth = Number(coins)
  return Number.isFinite(worth) ? worth.toFixed(4) : '0.0000'
}

function makeRow(said: string): { row: HTMLElement; fig: HTMLElement } {
  const row = document.createElement('div')
  row.className = 'housepurse__row'

  const name = document.createElement('span')
  name.className = 'housepurse__said'
  name.textContent = said

  const fig = document.createElement('b')
  fig.className = 'housepurse__fig'
  fig.textContent = '—'

  row.append(name, fig)
  return { row, fig }
}

export function hangTheHousePurse(address: string | null): Part {
  const call = document.createElement('button')
  call.type = 'button'
  call.className = 'housecall'
  call.append(
    drawMark({ name: 'coin', size: 13 }),
    document.createTextNode('The house will stake you')
  )

  const slip = document.createElement('div')
  slip.className = 'housepurse framed'
  slip.hidden = true

  const head = document.createElement('div')
  head.className = 'housepurse__head'

  const title = document.createElement('p')
  title.className = 'housepurse__title'
  title.textContent = 'The house purse'

  const shut = document.createElement('button')
  shut.type = 'button'
  shut.className = 'housepurse__shut'
  shut.textContent = 'Close'

  head.append(title, shut)

  const rows = document.createElement('div')
  rows.className = 'housepurse__rows'

  const yourSepolia = makeRow('You hold on Sepolia')
  const yourCreditcoin = makeRow('You hold on CC3')
  const poursSepolia = makeRow('The house will pour')
  const poursCreditcoin = makeRow('and on CC3')
  const left = makeRow('Purses left to you')

  rows.append(yourSepolia.row, yourCreditcoin.row, poursSepolia.row, poursCreditcoin.row, left.row)

  const take = document.createElement('button')
  take.type = 'button'
  take.className = 'housepurse__take'
  take.textContent = 'Take a purse'

  const trouble = document.createElement('p')
  trouble.className = 'housepurse__trouble'
  trouble.hidden = true

  const poured = document.createElement('div')
  poured.className = 'housepurse__poured'
  poured.hidden = true

  const aside = document.createElement('p')
  aside.className = 'housepurse__aside'
  aside.textContent = 'Testnet coin. Worth nothing anywhere.'

  slip.append(head, rows, take, trouble, poured, aside)
  document.body.append(slip)

  let asking = false

  function showTrouble(why: string | null): void {
    trouble.hidden = why === null
    trouble.textContent = why ?? ''
  }

  function showReading(reading: HouseReading): void {
    yourSepolia.fig.textContent = reading.youHold
      ? `${countCoin(reading.youHold.sepolia)} ETH`
      : 'no purse open'
    yourCreditcoin.fig.textContent = reading.youHold
      ? `${countCoin(reading.youHold.creditcoin)} tCTC`
      : 'no purse open'

    poursSepolia.fig.textContent = `${reading.purse.sepolia.drip} ETH`
    poursCreditcoin.fig.textContent = `${reading.purse.creditcoin.drip} tCTC`
    left.fig.textContent = `${reading.purse.pursesLeft} of ${reading.purse.mostPerAddress}`

    const dry = !reading.purse.sepolia.canGive && !reading.purse.creditcoin.canGive
    const spent = reading.purse.pursesLeft <= 0

    take.disabled = dry || spent || !address
    showTrouble(
      !address
        ? 'Open a purse first and the house will find you.'
        : spent
          ? 'The house has given you all it will.'
          : dry
            ? (reading.purse.sepolia.why ?? 'the house purse is empty')
            : null
    )
  }

  function showPoured(given: HandedOver[]): void {
    poured.hidden = false
    poured.replaceChildren()

    given.forEach((one) => {
      const line = document.createElement('a')
      line.className = 'housepurse__given'
      line.href = one.lookUpAt
      line.target = '_blank'
      line.rel = 'noopener'
      line.textContent = `${one.coins} ${one.coinSymbol} on ${one.shortName} →`
      poured.append(line)
    })
  }

  async function lookAtTheHouse(): Promise<void> {
    const answer = await askTheHouse(address)

    if (!theHouseAnswered(answer)) {
      take.disabled = true
      showTrouble(answer.trouble)
      return
    }

    showReading(answer.held)
  }

  function place(): void {
    const box = call.getBoundingClientRect()
    const wide = slip.offsetWidth
    const tall = slip.offsetHeight
    const across = document.documentElement.clientWidth
    const down = document.documentElement.clientHeight

    const below = box.bottom + 8
    const above = box.top - 8 - tall
    const top = below + tall <= down - 8 || above < 8 ? below : above

    slip.style.top = `${Math.round(Math.min(Math.max(8, top), Math.max(8, down - tall - 8)))}px`
    slip.style.left = `${Math.round(Math.min(Math.max(8, box.right - wide), Math.max(8, across - wide - 8)))}px`
  }

  function close(): void {
    slip.hidden = true
  }

  shut.addEventListener('click', close)

  call.addEventListener('click', () => {
    if (!slip.hidden) {
      close()
      return
    }

    slip.hidden = false
    place()
    latchClicks()
    void lookAtTheHouse()
  })

  take.addEventListener('click', () => {
    if (asking || !address) {
      return
    }

    asking = true
    take.disabled = true
    take.textContent = 'The house is counting'
    showTrouble(null)

    void askForAPurse(address)
      .then((answer) => {
        if (!theHouseAnswered(answer)) {
          showTrouble(answer.trouble)
          doorWontBudge()
          return
        }

        showPoured(answer.held.given)
        coinPoured()
        return lookAtTheHouse()
      })
      .finally(() => {
        asking = false
        take.textContent = 'Take a purse'
      })
  })

  return {
    element: call,

    teardown(): void {
      slip.remove()
      call.remove()
    }
  }
}
