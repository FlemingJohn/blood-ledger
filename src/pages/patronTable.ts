import type { Part } from '../types/parts'
import type { PurseKeeper } from '../types/purse'
import type { Role, RoleAnswer } from '../types/role'
import type { StakeYouMade, WhatYouOffer } from '../types/patron'
import { fillOutAStake } from '../parts/stakeSlip'
import { layOutSeeker } from '../parts/seekerCard'
import { hangTheRoleSwitch } from '../parts/roleSwitch'
import { hangTheTally } from '../parts/tally'
import { dressTheHall } from '../parts/hallDressing'

import { readSeekers } from '../chain/seekers'
import { stakeOnARaider } from '../chain/patronVault'
import { readRaider } from '../chain/theLedger'
import '../styles/patron.css'

export interface PatronTableOrder {
  purse: PurseKeeper
  address: string
  whenRoleAsked(role: Role): Promise<RoleAnswer> | RoleAnswer
}

export function buildPatronTable(order: PatronTableOrder): Part {
  const page = document.createElement('main')
  page.className = 'patronpage'

  const dressing = dressTheHall('working')

  const tally = hangTheTally(readRaider(order.address))

  const roleSwitch = hangTheRoleSwitch()
  roleSwitch.showRole('patron')
  roleSwitch.whenAsked(order.whenRoleAsked)

  tally.middleSeat.append(roleSwitch.element)

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
  page.append(dressing.element, tally.element, body)

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
      tally.teardown()
      dressing.teardown()
      page.remove()
    }
  }
}
