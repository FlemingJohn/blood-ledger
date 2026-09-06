import type { Part } from '../types/parts'
import type { StakeYouMade, WhatYouOffer } from '../types/patron'
import { lookUpStake, mostAPatronMayKeep, vaultIsDeployed } from '../chain/patronVault'
import { shortAddress } from '../chain/addresses'
import { drawMark } from './marks'
import '../styles/door.css'
import '../styles/patron.css'

export interface StakeSlipPart extends Part {
  whenOffered(listener: (offer: WhatYouOffer) => void): void
  showBusy(busy: boolean): void
  showStep(said: string): void
  showTrouble(said: string | null): void
  fillFor(raiderAddress: string): void
  addStake(stake: StakeYouMade): void
}

export function fillOutAStake(): StakeSlipPart {
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

  const step = document.createElement('p')
  step.className = 'stake__step'
  step.hidden = true

  const trouble = document.createElement('p')
  trouble.className = 'stake__trouble'
  trouble.hidden = true

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
    field('Stake', `${'ETH'} on Sepolia`, coins),
    field('You keep', 'of whatever they carry out', shareRow),
    offerButton,
    step,
    trouble,
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

    fillFor(raiderAddress: string): void {
      raider.value = raiderAddress
      raider.focus()
    },

    showTrouble(said: string | null): void {
      trouble.hidden = said === null
      trouble.textContent = said ?? ''
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
      listeners.clear()
      slip.remove()
    }
  }
}
