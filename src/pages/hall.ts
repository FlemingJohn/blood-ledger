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
import { askBeforeYouSign } from '../parts/askFirst'
import { watchWhatIsHappening } from '../parts/goingsOn'
import { layOutPowers } from '../parts/powerSlots'
import { showTheBond } from '../parts/bondSlip'
import { gradeReaches, readOffers, readRaider, sealPact } from '../chain/theLedger'
import { asAnOfferToYou, readTheBoard } from '../chain/whatIsOnTheBoard'
import { readWhoHasBeenDown } from '../chain/whoHasBeenDown'
import { askTheHouse, askTheHouseToBackYou, theHouseAnswered } from '../chain/house'
import { asAnOffer, houseOfferId } from '../chain/houseOffer'
import { rememberTheClass, takeTheChainsWord } from '../chain/whatYouHaveDone'
import { bondFromTheChain, openPactFromTheChain, standingFromTheChain } from '../chain/askTheLedger'
import { lockUpYourBond, plainly, theLedgerTakesWrites } from '../chain/tellTheLedger'
import { readProfile, readProfileFromTheChain } from '../chain/profiles'
import { guideTheWay } from '../parts/theTour'
import { askIfTheyWantShowing } from '../parts/askToShow'
import { haveYouSeen, markAsShown } from '../parts/whoHasBeenShown'
import { aroundTheHall } from '../tour/inTheHall'
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
  let seekingCoin = 0

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
            : `The ledger knows ${seekingCoin} raiders.`,
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
  const asking = askBeforeYouSign()
  const profile = openTheProfile()

  const tour = guideTheWay()
  const wantShowing = askIfTheyWantShowing()

  const tourCall = document.createElement('button')
  tourCall.type = 'button'
  tourCall.className = 'tourcall hallpage__tourcall'
  tourCall.title = 'Show me round'
  tourCall.setAttribute('aria-label', 'show me round')
  tourCall.textContent = '?'
  tourCall.addEventListener('click', () => tour.walk(aroundTheHall()))

  wantShowing.whenWanted(() => {
    markAsShown(order.address, 'the hall')
    tour.walk(aroundTheHall())
  })

  wantShowing.whenWaved(() => markAsShown(order.address, 'the hall'))

  if (!haveYouSeen(order.address, 'the hall')) {
    window.setTimeout(
      () =>
        wantShowing.ask(
          'First time in the hall?',
          'Nine bays, a board read from two chains, and the debt you are about to take on. Six steps, about a minute.'
        ),
      1400
    )
  }

  tally.whenNameAsked(() => {
    profile.showProfile(readProfile(order.address))
    void readProfileFromTheChain(order.address).then((told) => {
      if (told) {
        profile.showProfile(told)
      }
    })
  })

  let heldPact: Pact | null = null
  let sealing = false
  let chosenClass: RaiderClass = raider.chosenClass

  function kindestOpenToYou(): Offer | null {
    const reachable = offersHere.filter(
      (offer) => !offer.claimed && gradeReaches(raider.standing.grade, offer.needsGrade)
    )

    if (reachable.length === 0) {
      return null
    }

    return reachable.reduce((kindest, offer) =>
      offer.patronShare < kindest.patronShare ? offer : kindest
    )
  }

  function showWhatAPactWouldCost(): void {
    pactSlip.showWhatItWouldCost(kindestOpenToYou(), raider.standing.score)
  }

  function holdThePact(pact: Pact): void {
    heldPact = pact
    sealing = false
    pactSeals()
    pactSlip.showPact(pact)
    descent.showBarred(false)
    board.barTheBoard(true)
    roleSwitch.showBarred(true, 'you hold a pact — go down or it stands')
    tellTheSeats()
    window.setTimeout(() => rite.close(), 900)
  }

  function signFor(offer: Offer): void {
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

  asking.whenTaken(signFor)

  const board = openThePatronBoard({
    offers: offersHere,
    grade: raider.standing.grade,
    whenAccepted(offer: Offer) {
      if (sealing || heldPact) {
        return
      }
      asking.ask(offer, raider.standing.score)
    }
  })

  void readTheBoard(order.address).then((standing) => {
    if (!standing) {
      board.sayWhenBare('No vault is deployed, so no coin can be put up yet.')
      goingsOn.showTrouble('No vault is deployed yet.')
      return
    }

    standing.inYourName.forEach((putUp) => {
      const named = asAnOfferToYou(putUp)
      board.addOffer(named, 'offer--named')
      offersHere.push(named)
      openToYou += 1
    })

    board.sayWhenBare('Nobody has named you yet. Ask the House and it will put up coin for you.')
    goingsOn.show(standing.below)
    showWhatAPactWouldCost()
    tellTheSeats()
  })

  void readWhoHasBeenDown().then((everyone) => {
    seekingCoin = everyone.filter(
      (one) => one.address.toLowerCase() !== order.address.toLowerCase()
    ).length
    tellTheSeats()
  })

  void askTheHouse(order.address).then((answer) => {
    if (!theHouseAnswered(answer) || !answer.held.patron.canBack) {
      return
    }

    const fromTheHouse = asAnOffer(answer.held.patron)
    board.addOffer(fromTheHouse, 'offer--house')
    offersHere.push(fromTheHouse)
    openToYou += 1
    showWhatAPactWouldCost()
    tellTheSeats()
  })

  body.append(board.element, middle, rail)

  const goingsOn = watchWhatIsHappening()

  const foot = document.createElement('div')
  foot.className = 'hallpage__foot'
  foot.append(goingsOn.element, descent.element)

  hall.append(
    dressing.element,
    tally.element,
    body,
    foot,
    tourCall,
    wantShowing.element,
    rite.element,
    asking.element,
    profile.element
  )

  descent.showBarred(true)
  showWhatAPactWouldCost()
  tellTheSeats()
  let lockingUp = false

  descent.whenPushed(() => {
    if (!heldPact || lockingUp) {
      return
    }

    const going = heldPact

    if (going.pactId === null || !theLedgerTakesWrites) {
      stairOpens()
      order.whenDescending(going, chosenClass)
      return
    }

    lockingUp = true
    descent.sayWhatIsHappening('Your purse is being asked for the bond.', true)

    void lockUpYourBond(going.pactId)
      .then((locked) => {
        descent.sayWhatIsHappening(
          locked
            ? `${locked.locked} tCTC locked up. Walk out and it comes back.`
            : 'Your name is bond enough. Nothing to lock up.',
          false
        )
        stairOpens()
        order.whenDescending(going, chosenClass)
      })
      .catch((trouble: unknown) => {
        lockingUp = false
        descent.sayWhatIsHappening(`The bond did not go down — ${plainly(trouble)}.`, false)
      })
  })

  plinth.whenClassChanged((chosen) => {
    chosenClass = chosen
    rememberTheClass(order.address, chosen)
    powers.showClass(chosen)
    tally.showClass(chosen)
  })

  void standingFromTheChain(order.address).then((told) => {
    if (!told) {
      return
    }

    takeTheChainsWord(order.address, told.standing)
    tally.showStanding(told.standing)
    bond.showStanding(told.standing)
    showWhatAPactWouldCost()
  })

  void bondFromTheChain(order.address).then((owed) => {
    if (owed === null) {
      return
    }
    bond.showOwed(owed)
  })

  void openPactFromTheChain(order.address).then((standing) => {
    if (!standing || standing.settled || heldPact) {
      return
    }

    holdThePact({
      offerId: `pact-${standing.pactId}`,
      pactId: standing.pactId,
      patronAddress: standing.patronAddress,
      coinsStaked: standing.coinsStaked,
      patronShare: standing.patronShare,
      sealedAt: Date.now()
    })
  })

  void loadWhatYouCan(everyPieceOfHallArt)

  return {
    element: hall,
    teardown(): void {
      tour.teardown()
      wantShowing.teardown()
      board.teardown()
      bond.teardown()
      powers.teardown()
      goingsOn.teardown()
      profile.teardown()
      asking.teardown()
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
