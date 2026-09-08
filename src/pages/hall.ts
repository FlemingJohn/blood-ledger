import type { Offer, Pact } from '../types/pact'
import type { RaiderClass } from '../types/raider'
import type { Role, RoleAnswer } from '../types/role'
import type { Part } from '../types/parts'
import { dressTheHall } from '../parts/hallDressing'
import { hangTheTally } from '../parts/tally'
import { hangTheRoleSwitch } from '../parts/roleSwitch'
import { raiseThePlinth } from '../parts/plinth'
import { pinUpThePact } from '../parts/pactSlip'
import { buildDescent } from '../parts/descentDoor'
import { openThePatronBoard } from '../parts/patronBoard'
import { openTheProfile } from '../parts/profileCard'
import { drawChain } from '../parts/hallMarks'
import { prepareTheRite } from '../parts/sealingRite'
import { unrollTheLedger } from '../parts/ledgerFeed'
import { layOutPowers } from '../parts/powerSlots'
import { showTheBond } from '../parts/bondSlip'
import { gradeReaches, readLedger, readOffers, readRaider, sealPact } from '../chain/theLedger'
import { readSeekers } from '../chain/seekers'
import { askTheHouse, askTheHouseToBackYou, theHouseAnswered } from '../chain/house'
import { asAnOffer, houseOfferId } from '../chain/houseOffer'
import { rememberTheClass } from '../chain/whatYouHaveDone'
import { readProfile } from '../chain/profiles'
import { pactSeals, stairOpens, waxPressed } from '../sound/blows'
import { everyPieceOfHallArt } from '../art/paths'
import { loadWhatYouCan } from '../art/pictures'
import '../styles/hall.css'
import '../styles/hallMarks.css'

export interface HallOrder {
  address: string
  whenRoleAsked(role: Role): Promise<RoleAnswer> | RoleAnswer
  whenDescending(pact: Pact, chosenClass: RaiderClass): void
}

export function buildHall(order: HallOrder): Part {
  const hall = document.createElement('main')
  hall.className = 'hallpage'

  const dressing = dressTheHall('working')

  const raider = readRaider(order.address)
  const tally = hangTheTally(raider)

  const roleSwitch = hangTheRoleSwitch()
  roleSwitch.showRole('raider')

  const offersHere = readOffers(raider)
  let openToYou = offersHere.filter(
    (offer) => !offer.claimed && gradeReaches(raider.standing.grade, offer.needsGrade)
  ).length
  const seekingCoin = readSeekers().length

  function tellTheSeats(): void {
    const holding = heldPact !== null

    roleSwitch.showSeats({
      raider: {
        count: openToYou,
        why: holding
          ? `You owe ${heldPact ? heldPact.coinsStaked : 0}. The stair is open.`
          : openToYou > 0
            ? `${openToYou} ${openToYou === 1 ? 'patron' : 'patrons'} will fund you.`
            : 'No offer reaches your standing yet.',
        state: 'here'
      },
      patron: {
        count: seekingCoin,
        why: holding
          ? 'A pact stands. Go down or settle it first.'
          : openToYou === 0
            ? 'Nothing to raid. Earn standing by funding someone instead.'
            : `${seekingCoin} raiders want coin.`,
        state: holding ? 'barred' : seekingCoin > 0 ? 'open' : 'quiet'
      }
    })
  }
  roleSwitch.whenAsked(order.whenRoleAsked)

  tally.middleSeat.append(roleSwitch.element)

  const body = document.createElement('div')
  body.className = 'hallpage__body'

  const plinth = raiseThePlinth(raider.chosenClass)
  const pactSlip = pinUpThePact()
  const descent = buildDescent()
  const powers = layOutPowers(raider.chosenClass)
  const bond = showTheBond(raider.standing)

  const middle = document.createElement('div')
  middle.className = 'hallpage__middle'
  middle.append(plinth.element)

  const rail = document.createElement('aside')
  rail.className = 'hallpage__rail'
  const hanging = drawChain()
  hanging.classList.add('hallpage__chain')

  rail.append(hanging, pactSlip.element, powers.element, bond.element)

  const rite = prepareTheRite()
  const profile = openTheProfile()

  tally.whenNameAsked(() => profile.showProfile(readProfile(order.address)))

  let heldPact: Pact | null = null
  let sealing = false
  let chosenClass: RaiderClass = raider.chosenClass

  function holdThePact(pact: Pact): void {
    heldPact = pact
    sealing = false
    pactSeals()
    pactSlip.showPact(pact)
    descent.showBarred(false)
    roleSwitch.showBarred(true, 'you hold a pact — go down or it stands')
    tellTheSeats()
    window.setTimeout(() => rite.close(), 900)
  }

  const board = openThePatronBoard({
    offers: offersHere,
    grade: raider.standing.grade,
    whenAccepted(offer: Offer) {
      if (sealing || heldPact) {
        return
      }
      sealing = true
      waxPressed()
      rite.open()

      const staked =
        offer.id === houseOfferId
          ? askTheHouseToBackYou(order.address).then((answer) => {
              if (!theHouseAnswered(answer)) {
                throw new Error(answer.trouble)
              }
            })
          : Promise.resolve()

      void staked
        .then(() => sealPact(offer, (progress) => rite.showProgress(progress)))
        .then(holdThePact)
        .catch((trouble: Error) => {
          sealing = false
          rite.showProgress({ steps: [], finished: false, trouble: trouble.message })
        })
    }
  })

  void askTheHouse(order.address).then((answer) => {
    if (!theHouseAnswered(answer) || !answer.held.patron.canBack) {
      return
    }

    board.addOffer(asAnOffer(answer.held.patron), 'offer--house')
    openToYou += 1
    tellTheSeats()
  })

  body.append(board.element, middle, rail)

  const ledger = unrollTheLedger(readLedger().slice(0, 3))

  const foot = document.createElement('div')
  foot.className = 'hallpage__foot'
  foot.append(ledger.element, descent.element)

  hall.append(dressing.element, tally.element, body, foot, rite.element, profile.element)

  descent.showBarred(true)
  tellTheSeats()
  descent.whenPushed(() => {
    if (heldPact) {
      stairOpens()
      order.whenDescending(heldPact, chosenClass)
    }
  })

  plinth.whenClassChanged((chosen) => {
    chosenClass = chosen
    rememberTheClass(order.address, chosen)
    powers.showClass(chosen)
  })

  void loadWhatYouCan(everyPieceOfHallArt)

  return {
    element: hall,
    teardown(): void {
      board.teardown()
      bond.teardown()
      powers.teardown()
      ledger.teardown()
      profile.teardown()
      rite.teardown()
      descent.teardown()
      pactSlip.teardown()
      plinth.teardown()
      roleSwitch.teardown()
      tally.teardown()
      dressing.teardown()
      hall.remove()
    }
  }
}
