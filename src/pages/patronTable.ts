import type { Part } from '../types/parts'
import type { PurseKeeper } from '../types/purse'
import type { Role } from '../types/role'
import type { StakeYouMade, WhatYouOffer } from '../types/patron'
import { fillOutAStake } from '../parts/stakeSlip'
import { layOutSeeker } from '../parts/seekerCard'
import { hangTheRoleSwitch } from '../parts/roleSwitch'
import { dressTheHall } from '../parts/hallDressing'
import { drawMark } from '../parts/marks'
import { readSeekers } from '../chain/seekers'
import { stakeOnARaider, vaultIsDeployed } from '../chain/patronVault'
import { shortAddress } from '../chain/addresses'
import { realmWherePatronsPay } from '../chain/realms'
import '../styles/patron.css'

export interface PatronTableOrder {
  purse: PurseKeeper
  address: string
  whenRoleAsked(role: Role): void
}

export function buildPatronTable(order: PatronTableOrder): Part {
  const page = document.createElement('main')
  page.className = 'patronpage'

  const dressing = dressTheHall('working')

  const tally = document.createElement('header')
  tally.className = 'tally'

  const tallyLine = document.createElement('div')
  tallyLine.className = 'tally__line'

  const mark = document.createElement('span')
  mark.className = 'tally__mark'
  mark.textContent = 'Blood Ledger'

  const roleSwitch = hangTheRoleSwitch()
  roleSwitch.showRole('patron')
  roleSwitch.whenAsked(order.whenRoleAsked)

  const facts = document.createElement('div')
  facts.className = 'tally__facts'

  const who = document.createElement('span')
  who.className = 'tally__who'
  who.textContent = shortAddress(order.address)

  const realm = document.createElement('span')
  realm.className = 'tally__realm'
  realm.append(drawMark({ name: 'scales', size: 14 }))
  realm.append(document.createTextNode(` ${realmWherePatronsPay.name}`))

  facts.append(who, realm)
  tallyLine.append(mark, roleSwitch.element, facts)
  tally.append(tallyLine)

  if (!vaultIsDeployed) {
    const warned = document.createElement('p')
    warned.className = 'tally__rehearsal'
    warned.title =
      'Set VITE_PATRON_VAULT_ADDRESS once the vault is deployed and this table starts moving real coin.'
    warned.textContent = 'no vault deployed — nothing here can be staked yet'
    tally.append(warned)
  }

  const body = document.createElement('div')
  body.className = 'patronpage__body'

  const slip = fillOutAStake()

  const board = document.createElement('section')
  board.className = 'board'

  const boardHead = document.createElement('header')
  boardHead.className = 'board__head'

  const boardTitle = document.createElement('h2')
  boardTitle.className = 'board__title'
  boardTitle.textContent = 'Raiders Seeking Coin'

  const boardCount = document.createElement('span')
  boardCount.className = 'board__count'

  boardHead.append(boardTitle, boardCount)

  const boardList = document.createElement('div')
  boardList.className = 'board__list'

  board.append(boardHead, boardList)

  const seekers = readSeekers()
  let openToYou = 0

  const cards = seekers.map((seeker) => {
    const isYou = seeker.raider.address.toLowerCase() === order.address.toLowerCase()
    if (!isYou) {
      openToYou += 1
    }

    const card = layOutSeeker(seeker.raider, seeker.note, isYou)

    card.whenBacked((raider) => {
      slip.fillFor(raider.address)
    })

    boardList.append(card.element)
    return card
  })

  boardCount.textContent = `${openToYou} you may back of ${seekers.length}`

  body.append(slip.element, board)
  page.append(dressing.element, tally, body)

  let staking = false

  slip.whenOffered((offer: WhatYouOffer) => {
    if (staking) {
      return
    }
    if (offer.raider.toLowerCase() === order.address.toLowerCase()) {
      slip.showTrouble('You cannot put up coin for yourself.')
      return
    }

    staking = true
    slip.showTrouble(null)
    slip.showBusy(true)

    void stakeOnARaider(offer, (progress) => {
      slip.showStep(progress.step)
    })
      .then((made: StakeYouMade) => {
        slip.addStake(made)
        slip.showTrouble(null)
      })
      .catch((trouble: Error) => {
        slip.showTrouble(trouble.message)
      })
      .finally(() => {
        staking = false
        slip.showBusy(false)
      })
  })

  return {
    element: page,
    teardown(): void {
      cards.forEach((card) => card.teardown())
      slip.teardown()
      roleSwitch.teardown()
      dressing.teardown()
      page.remove()
    }
  }
}
