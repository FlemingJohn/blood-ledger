import type { Part } from '../types/parts'
import type { StakeYouMade, WhatYouOffer } from '../types/patron'
import {
  lookUpStake,
  mostAPatronMayKeep,
  roomForGas,
  vaultIsDeployed,
  whatYouHoldToStakeWith,
  type WhatYouHold
} from '../chain/patronVault'
import { shortAddress } from '../chain/addresses'
import { readTheRaider } from './whoIsThis'
import { drawMark } from './marks'
import '../styles/door.css'
import '../styles/patron.css'

const waitBeforeAsking = 420

export interface MendIt {
  said: string
  busySaid: string
  doIt(): Promise<string | null>
}

export interface StakeSlipPart extends Part {
  whenOffered(listener: (offer: WhatYouOffer) => void): void
  showBusy(busy: boolean): void
  showStep(said: string): void
  showTrouble(said: string | null, mend?: MendIt | null): void
  whenPurseIsShort(fill: () => Promise<string | null>): void
  readThePurseAgain(): void
  fillFor(raiderAddress: string): void
  addStake(stake: StakeYouMade): void
}

export function fillOutAStake(patronAddress: string): StakeSlipPart {
  const slip = document.createElement('form')
  slip.className = 'stake framed'

  function field(label: string, hint: string, control: HTMLElement): HTMLElement {
    const row = document.createElement('label')
    row.className = 'stake__row'

    const said = document.createElement('span')
    said.className = 'stake__label'
    said.textContent = label

    const aside = document.createElement('span')
    aside.className = 'stake__hint'
    aside.textContent = hint

    row.append(said, control, aside)
    return row
  }

  const raider = document.createElement('input')
  raider.type = 'text'
  raider.className = 'stake__input'
  raider.placeholder = '0x…'
  raider.spellcheck = false
  raider.required = true

  const record = readTheRaider()

  let waiting = 0

  function askTheLedgerAbout(address: string): void {
    window.clearTimeout(waiting)

    if (address.trim() === '') {
      record.clear()
      return
    }

    waiting = window.setTimeout(() => record.lookUp(address, patronAddress), waitBeforeAsking)
  }

  raider.addEventListener('input', () => askTheLedgerAbout(raider.value))

  const coins = document.createElement('input')
  coins.type = 'text'
  coins.className = 'stake__input'
  coins.value = '0.01'
  coins.required = true

  const share = document.createElement('input')
  share.type = 'range'
  share.className = 'stake__slider'
  share.min = '0'
  share.max = String(mostAPatronMayKeep)
  share.value = '40'

  const shareSaid = document.createElement('output')
  shareSaid.className = 'stake__share'
  shareSaid.textContent = '40%'

  share.addEventListener('input', () => {
    shareSaid.textContent = `${share.value}%`
  })

  const shareRow = document.createElement('div')
  shareRow.className = 'stake__shareRow'
  shareRow.append(share, shareSaid)

  const offerButton = document.createElement('button')
  offerButton.type = 'submit'
  offerButton.className = 'door door--stake'

  offerButton.append(drawMark({ name: 'coin', size: 15 }))

  const offerWord = document.createElement('span')
  offerWord.className = 'door__word'
  offerWord.textContent = 'Put Up The Coin'
  offerButton.append(offerWord)

  const short = document.createElement('p')
  short.className = 'stake__short'
  short.hidden = true

  const fillUp = document.createElement('button')
  fillUp.type = 'button'
  fillUp.className = 'stake__mend'
  fillUp.textContent = 'The house will fill your purse'
  fillUp.hidden = true

  let held: WhatYouHold | null = null
  let weighing = 0

  function inWei(said: string): bigint | null {
    const worth = Number(said)
    if (!Number.isFinite(worth) || worth < 0) {
      return null
    }
    return BigInt(Math.round(worth * 1e9)) * 1_000_000_000n
  }

  function trimmed(said: string): string {
    const worth = Number(said)
    return Number.isFinite(worth) ? worth.toFixed(4) : said
  }

  function weighThePurse(): void {
    const wanted = inWei(coins.value)
    const gas = inWei(roomForGas) ?? 0n

    if (!held || wanted === null) {
      short.hidden = true
      fillUp.hidden = true
      offerButton.disabled = false
      return
    }

    if (held.wei >= wanted + gas) {
      short.hidden = true
      fillUp.hidden = true
      offerButton.disabled = false
      return
    }

    short.hidden = false
    short.textContent = `You hold ${trimmed(held.eth)} ETH. This stake needs ${trimmed(coins.value)} plus about ${roomForGas} for gas.`
    fillUp.hidden = !fillUpDoes
    offerButton.disabled = true
  }

  let fillUpDoes: (() => Promise<string | null>) | null = null

  fillUp.addEventListener('click', () => {
    if (!fillUpDoes) {
      return
    }

    fillUp.disabled = true
    fillUp.textContent = 'The house is counting'

    void fillUpDoes()
      .then((wentWrong) => {
        if (wentWrong) {
          short.textContent = wentWrong
          return
        }
        return readThePurse()
      })
      .finally(() => {
        fillUp.disabled = false
        fillUp.textContent = 'The house will fill your purse'
      })
  })

  async function readThePurse(): Promise<void> {
    held = await whatYouHoldToStakeWith(patronAddress)
    weighThePurse()
  }

  coins.addEventListener('input', () => {
    window.clearTimeout(weighing)
    weighing = window.setTimeout(weighThePurse, 250)
  })

  void readThePurse()

  const step = document.createElement('p')
  step.className = 'stake__step'
  step.hidden = true

  const trouble = document.createElement('p')
  trouble.className = 'stake__trouble'
  trouble.hidden = true

  const mending = document.createElement('button')
  mending.type = 'button'
  mending.className = 'stake__mend'
  mending.hidden = true

  const madeLabel = document.createElement('p')
  madeLabel.className = 'panel__label'
  madeLabel.textContent = 'What you have staked'

  const made = document.createElement('ul')
  made.className = 'stake__made'

  const nothingYet = document.createElement('li')
  nothingYet.className = 'stake__none'
  nothingYet.textContent = 'Nothing yet. Fund a raider and they can descend.'
  made.append(nothingYet)

  slip.append(
    field('Raider', 'the address going down', raider),
    record.element,
    field('Stake', `${'ETH'} on Sepolia`, coins),
    field('You keep', 'of whatever they carry out', shareRow),
    short,
    fillUp,
    offerButton,
    step,
    trouble,
    mending,
    madeLabel,
    made
  )

  if (!vaultIsDeployed) {
    offerButton.disabled = true
    offerWord.textContent = 'No Vault Yet'
  }

  const listeners = new Set<(offer: WhatYouOffer) => void>()

  slip.addEventListener('submit', (event) => {
    event.preventDefault()
    listeners.forEach((listener) =>
      listener({
        raider: raider.value.trim(),
        coins: coins.value.trim(),
        patronShare: Number(share.value)
      })
    )
  })

  return {
    element: slip,

    whenOffered(listener: (offer: WhatYouOffer) => void): void {
      listeners.add(listener)
    },

    showBusy(busy: boolean): void {
      offerButton.disabled = busy || !vaultIsDeployed
      offerWord.textContent = busy
        ? 'Waiting'
        : vaultIsDeployed
          ? 'Put Up The Coin'
          : 'No Vault Yet'
      if (!busy) {
        step.hidden = true
      }
    },

    showStep(said: string): void {
      step.hidden = false
      step.textContent = said
    },

    whenPurseIsShort(fill: () => Promise<string | null>): void {
      fillUpDoes = fill
      weighThePurse()
    },

    readThePurseAgain(): void {
      void readThePurse()
    },

    fillFor(raiderAddress: string): void {
      raider.value = raiderAddress
      raider.focus()
      askTheLedgerAbout(raiderAddress)
    },

    showTrouble(said: string | null, mend?: MendIt | null): void {
      trouble.hidden = said === null
      trouble.textContent = said ?? ''

      mending.hidden = !mend
      mending.onclick = null

      if (!mend) {
        return
      }

      mending.disabled = false
      mending.textContent = mend.said

      mending.onclick = (): void => {
        mending.disabled = true
        mending.textContent = mend.busySaid

        void mend
          .doIt()
          .then((wentWrong) => {
            if (wentWrong) {
              trouble.textContent = wentWrong
              mending.disabled = false
              mending.textContent = mend.said
              return
            }
            trouble.hidden = true
            mending.hidden = true
          })
          .catch(() => {
            mending.disabled = false
            mending.textContent = mend.said
          })
      }
    },

    addStake(stake: StakeYouMade): void {
      nothingYet.remove()

      const line = document.createElement('li')
      line.className = 'stake__one'

      const who = document.createElement('span')
      who.className = 'stake__who'
      who.textContent = shortAddress(stake.raider)

      const amount = document.createElement('b')
      amount.textContent = `${stake.coinsStaked} ETH`

      const cut = document.createElement('span')
      cut.className = 'stake__cut'
      cut.textContent = `you keep ${stake.patronShare}%`

      const seen = document.createElement('a')
      seen.className = 'stake__seen'
      seen.href = lookUpStake(stake.txHash)
      seen.target = '_blank'
      seen.rel = 'noopener'
      seen.textContent = 'on Sepolia'

      line.append(who, amount, cut, seen)
      made.prepend(line)
    },

    teardown(): void {
      window.clearTimeout(waiting)
      listeners.clear()
      record.teardown()
      slip.remove()
    }
  }
}
