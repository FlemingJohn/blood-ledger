import type { Offer, Pact } from '../types/pact'
import type { RaiderClass } from '../types/raider'
import type { Role, RoleAnswer } from '../types/role'
import type { Part } from '../types/parts'
import { dressTheHall } from '../parts/hallDressing'
import { hangTheTally } from '../parts/tally'
import { hangTheRoleSwitch } from '../parts/roleSwitch'
import { raiseThePlinth } from '../parts/plinth'
import { showStanding } from '../parts/standingBar'
import { pinUpThePact } from '../parts/pactSlip'
import { buildDescent } from '../parts/descentDoor'
import { openThePatronBoard } from '../parts/patronBoard'
import { openTheProfile } from '../parts/profileCard'
import { drawChain } from '../parts/hallMarks'
import { prepareTheRite } from '../parts/sealingRite'
import { unrollTheLedger } from '../parts/ledgerFeed'
import { layOutPowers } from '../parts/powerSlots'
import { showTheBond } from '../parts/bondSlip'
import { readLedger, readOffers, readRaider, sealPact } from '../chain/theLedger'
import { readProfile } from '../chain/profiles'
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
  roleSwitch.whenAsked(order.whenRoleAsked)

  tally.middleSeat.append(roleSwitch.element)

  const body = document.createElement('div')
  body.className = 'hallpage__body'

  const plinth = raiseThePlinth(raider.chosenClass)
  const standing = showStanding(raider.standing)
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

  rail.append(hanging, pactSlip.element, powers.element, bond.element, standing.element)

  const rite = prepareTheRite()
  const profile = openTheProfile()

  tally.whenNameAsked(() => profile.showProfile(readProfile(order.address)))

  let heldPact: Pact | null = null
  let sealing = false
  let chosenClass: RaiderClass = raider.chosenClass

  const board = openThePatronBoard({
    offers: readOffers(raider),
    grade: raider.standing.grade,
    whenAccepted(offer: Offer) {
      if (sealing || heldPact) {
        return
      }
      sealing = true
      rite.open()

      void sealPact(offer, (progress) => rite.showProgress(progress)).then((pact) => {
        heldPact = pact
        sealing = false
        pactSlip.showPact(pact)
        descent.showBarred(false)
        roleSwitch.showBarred(true, 'you hold a pact — go down or it stands')
        window.setTimeout(() => rite.close(), 900)
      })
    }
  })

  body.append(board.element, middle, rail)

  const ledger = unrollTheLedger(readLedger().slice(0, 3))

  const foot = document.createElement('div')
  foot.className = 'hallpage__foot'
  foot.append(ledger.element, descent.element)

  hall.append(dressing.element, tally.element, body, foot, rite.element, profile.element)

  descent.showBarred(true)
  descent.whenPushed(() => {
    if (heldPact) {
      order.whenDescending(heldPact, chosenClass)
    }
  })

  plinth.whenClassChanged((chosen) => {
    chosenClass = chosen
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
      standing.teardown()
      plinth.teardown()
      roleSwitch.teardown()
      tally.teardown()
      dressing.teardown()
      hall.remove()
    }
  }
}
