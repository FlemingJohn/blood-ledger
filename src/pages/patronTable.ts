import type { Part } from '../types/parts'
import type { PurseKeeper } from '../types/purse'
import type { Role, RoleAnswer } from '../types/role'
import type { StakeYouMade, WhatYouOffer } from '../types/patron'
import { fillOutAStake } from '../parts/stakeSlip'
import { askBeforeYouStake } from '../parts/askToStake'
import { layOutSeeker } from '../parts/seekerCard'
import { hangTheRoleSwitch } from '../parts/roleSwitch'
import { hangTheTally } from '../parts/tally'
import { openTheProfile } from '../parts/profileCard'
import { drawBinding, drawCoinStack, drawScales } from '../parts/hallMarks'
import { readProfile } from '../chain/profiles'
import { dressTheHall } from '../parts/hallDressing'

import { readSeekers } from '../chain/seekers'
import { stakeOnARaider } from '../chain/patronVault'
import { writeUpTheStake } from '../chain/whatYouHaveDone'
import { gradeReaches, readOffers, readRaider } from '../chain/theLedger'
import { readTheBoard } from '../chain/whatIsOnTheBoard'
import '../styles/hallMarks.css'
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

  const youAsRaider = readRaider(order.address)
  const tally = hangTheTally(youAsRaider)
  const profile = openTheProfile()

  tally.whenNameAsked(() => profile.showProfile(readProfile(order.address)))

  let offersOpenToYou = readOffers(youAsRaider).filter(
    (offer) => !offer.claimed && gradeReaches(youAsRaider.standing.grade, offer.needsGrade)
  ).length
  const seekingCoin = readSeekers().filter(
    (seeker) => seeker.raider.address.toLowerCase() !== order.address.toLowerCase()
  ).length

  const roleSwitch = hangTheRoleSwitch()
  roleSwitch.showRole('patron')

  function tellTheSeats(): void {
    roleSwitch.showSeats({
      patron: {
        count: seekingCoin,
        why: seekingCoin > 0
          ? `You are here. ${seekingCoin} raiders want coin.`
          : 'No one is asking for coin.',
        state: 'here'
      },
      raider: {
        count: offersOpenToYou,
        why: offersOpenToYou > 0
          ? `${offersOpenToYou} ${offersOpenToYou === 1 ? 'patron' : 'patrons'} will fund you.`
          : 'No offer reaches your standing yet.',
        state: offersOpenToYou > 0 ? 'open' : 'quiet'
      }
    })
  }

  tellTheSeats()
  roleSwitch.whenAsked(order.whenRoleAsked)

  void readTheBoard(order.address).then((standing) => {
    if (!standing || standing.inYourName.length === 0) {
      return
    }

    offersOpenToYou += standing.inYourName.length
    tellTheSeats()
  })

  tally.middleSeat.append(roleSwitch.element)

  const body = document.createElement('div')
  body.className = 'patronpage__body'

  const slip = fillOutAStake(order.address)
  const confirming = askBeforeYouStake()

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

  const weighing = drawScales()
  weighing.classList.add('board__scales')

  const spine = drawBinding()
  spine.classList.add('board__binding')

  board.append(weighing, spine, boardHead, boardList)

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

  const coins = drawCoinStack()
  coins.classList.add('stake__coins')
  slip.element.append(coins)

  body.append(slip.element, board)
  page.append(dressing.element, tally.element, body, confirming.element, profile.element)

  let staking = false

  slip.whenOffered((offer: WhatYouOffer) => {
    if (staking) {
      return
    }
    if (offer.raider.toLowerCase() === order.address.toLowerCase()) {
      slip.showTrouble('You cannot put up coin for yourself.')
      return
    }

    slip.showTrouble(null)
    confirming.ask(offer, order.address)
  })

  confirming.whenPutUp((offer: WhatYouOffer) => {
    if (staking) {
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
        writeUpTheStake(order.address, made.raider, Number(made.coinsStaked))
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
      profile.teardown()
      confirming.teardown()
      slip.teardown()
      roleSwitch.teardown()
      tally.teardown()
      dressing.teardown()
      page.remove()
    }
  }
}
