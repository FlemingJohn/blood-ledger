import type { Offer, Pact } from '../types/pact'
import type { Part } from '../types/parts'
import { dressTheHall } from '../parts/hallDressing'
import { hangTheTally } from '../parts/tally'
import { raiseThePlinth } from '../parts/plinth'
import { showStanding } from '../parts/standingBar'
import { pinUpThePact } from '../parts/pactSlip'
import { buildDescent } from '../parts/descentDoor'
import { openThePatronBoard } from '../parts/patronBoard'
import { prepareTheRite } from '../parts/sealingRite'
import { unrollTheLedger } from '../parts/ledgerFeed'
import { readLedger, readOffers, readRaider, sealPact } from '../chain/theLedger'
import { everyPieceOfHallArt, restOfTheRaiders } from '../art/paths'
import { loadWhatYouCan } from '../art/pictures'
import '../styles/hall.css'

export interface HallOrder {
  address: string
  whenDescending(pact: Pact): void
}

export function buildHall(order: HallOrder): Part {
  const hall = document.createElement('main')
  hall.className = 'hallpage'

  const dressing = dressTheHall('working')

  const raider = readRaider(order.address)
  const tally = hangTheTally(raider)

  const body = document.createElement('div')
  body.className = 'hallpage__body'

  const left = document.createElement('div')
  left.className = 'hallpage__left'

  const plinth = raiseThePlinth(raider.chosenClass)
  const standing = showStanding(raider.standing)
  const pactSlip = pinUpThePact()
  const descent = buildDescent()

  left.append(plinth.element, standing.element, pactSlip.element, descent.element)

  const rite = prepareTheRite()

  let heldPact: Pact | null = null
  let sealing = false

  const board = openThePatronBoard({
    offers: readOffers(),
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
        window.setTimeout(() => rite.close(), 900)
      })
    }
  })

  body.append(left, board.element)

  const ledger = unrollTheLedger(readLedger().slice(0, 3))

  hall.append(dressing.element, tally.element, body, ledger.element, rite.element)

  descent.showBarred(true)
  descent.whenPushed(() => {
    if (heldPact) {
      order.whenDescending(heldPact)
    }
  })

  plinth.whenClassChanged(() => {
    void loadWhatYouCan(restOfTheRaiders)
  })

  void loadWhatYouCan(everyPieceOfHallArt)
  window.setTimeout(() => void loadWhatYouCan(restOfTheRaiders), 1200)

  return {
    element: hall,
    teardown(): void {
      board.teardown()
      ledger.teardown()
      rite.teardown()
      descent.teardown()
      pactSlip.teardown()
      standing.teardown()
      plinth.teardown()
      tally.teardown()
      dressing.teardown()
      hall.remove()
    }
  }
}
