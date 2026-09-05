import type { Part } from '../types/parts'
import type { PurseKeeper, PurseReading } from '../types/purse'
import { buildDoor } from '../parts/door'
import { buildScroll } from '../parts/scroll'
import { dressTheHall } from '../parts/hallDressing'
import { lightTorch } from '../parts/torch'
import { homeRealm, realmWherePatronsPay } from '../chain/realms'
import '../styles/landing.css'

const purseHomePage = 'https://metamask.io/download/'

const howItWorks = {
  title: 'How this works',
  steps: [
    'A patron puts up the coin for your descent. They pay on Ethereum.',
    'Creditcoin proves that payment is real, then hands you a blade and a debt.',
    'You go down. You kill what moves. You decide when to turn back.',
    'Walk out alive and you split the haul. Fall, and their coin is gone with you.'
  ],
  note: 'Every raid is settled on chain, and the ledger keeps your name either way.'
}

const becomeAPatron = {
  title: 'Become a patron',
  steps: [
    'Pick a raider whose standing you trust.',
    'Stake your coin and name the share you want back.',
    'Watch them descend. You cannot help them from up here.',
    'They live, you profit. They die, you lose the lot.'
  ],
  note: 'Standing is earned in blood, not promises. Read the ledger before you fund anyone.'
}

function makeTitle(): HTMLHeadingElement {
  const title = document.createElement('h1')
  title.className = 'title'
  title.textContent = 'Blood Ledger'
  return title
}

function makePromise(): HTMLParagraphElement {
  const promise = document.createElement('p')
  promise.className = 'promise'
  promise.append(
    document.createTextNode('Someone gives you money to go into a dungeon. If you succeed, you both profit. If you die, '),
  )
  const cost = document.createElement('strong')
  cost.textContent = 'their money is gone'
  promise.append(cost, document.createTextNode('.'))
  return promise
}

function makeFooting(): HTMLElement {
  const footing = document.createElement('footer')
  footing.className = 'footing'

  const line = document.createElement('div')
  line.className = 'footing__line'

  const realms = document.createElement('span')
  realms.textContent = `${homeRealm.name} · funded from ${realmWherePatronsPay.name}`

  const proof = document.createElement('span')
  proof.className = 'footing__proof'
  proof.append(document.createTextNode('Cross-chain payment proven by Attestcoin '))
  const mark = document.createElement('b')
  mark.textContent = 'verified'
  proof.append(mark)

  line.append(realms, proof)
  footing.append(line)
  return footing
}

export interface LandingOrder {
  purse: PurseKeeper
  whenHallOpens(reading: PurseReading): void
}

export function buildLanding(order: LandingOrder): Part {
  const landing = document.createElement('main')
  landing.className = 'landing'

  const dressing = dressTheHall()

  const hall = document.createElement('div')
  hall.className = 'hall'

  const leftTorch = document.createElement('div')
  const rightTorch = document.createElement('div')

  const centre = document.createElement('div')
  centre.className = 'centre'

  const door = buildDoor()

  const scrolls = document.createElement('div')
  scrolls.className = 'scrolls'
  const firstScroll = buildScroll(howItWorks)
  const secondScroll = buildScroll(becomeAPatron)
  scrolls.append(firstScroll.element, secondScroll.element)

  centre.append(makeTitle(), makePromise(), door.element, scrolls)
  hall.append(leftTorch, centre, rightTorch)
  landing.append(dressing.element, hall, makeFooting())

  const torches: Part[] = []

  void lightTorch().then((torch) => {
    leftTorch.replaceWith(torch.element)
    torches.push(torch)
  })

  void lightTorch().then((torch) => {
    rightTorch.replaceWith(torch.element)
    torches.push(torch)
  })

  const stopWatching = order.purse.watch((reading) => {
    door.showStanding(reading.standing)
  })

  door.whenPushed(() => {
    const reading = order.purse.read()

    if (reading.standing === 'no purse found') {
      window.open(purseHomePage, '_blank', 'noopener')
      return
    }

    if (reading.standing === 'wrong realm') {
      void order.purse.moveToHomeRealm()
      return
    }

    if (reading.standing === 'opened') {
      order.whenHallOpens(reading)
      return
    }

    void order.purse.open()
  })

  return {
    element: landing,
    teardown(): void {
      stopWatching()
      torches.forEach((torch) => torch.teardown())
      firstScroll.teardown()
      secondScroll.teardown()
      door.teardown()
      dressing.teardown()
      landing.remove()
    }
  }
}
