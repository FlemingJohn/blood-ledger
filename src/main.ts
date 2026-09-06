import './styles/theme.css'
import './styles/marks.css'
import type { Part } from './types/parts'
import type { Pact } from './types/pact'
import type { RaiderClass } from './types/raider'
import { keepPurse } from './chain/purse'
import { buildLanding } from './pages/landing'
import { buildHall } from './pages/hall'
import { buildDescent } from './pages/descent'
import { buildPatronTable } from './pages/patronTable'
import { armThePointer } from './parts/pointer'
import type { PointerMood } from './types/pointer'
import { everyPieceOfArt } from './art/paths'
import { loadWhatYouCan } from './art/pictures'
import type { Role } from './types/role'
import { seedForTheDescent } from './chain/attestedSeed'
import { homeRealm, realmWherePatronsPay } from './chain/realms'

type PageName = 'landing' | 'hall' | 'descent' | 'patron'

function findStage(): HTMLDivElement {
  const found = document.querySelector<HTMLDivElement>('#game')
  if (!found) {
    throw new Error('the page is missing its stage')
  }
  return found
}

const stage = findStage()

const raiderPurse = keepPurse(homeRealm)
const patronPurse = keepPurse(realmWherePatronsPay)

const hand = armThePointer()

const moodForPage: Record<PageName, PointerMood> = {
  landing: 'resting',
  hall: 'patron',
  descent: 'enemy',
  patron: 'loot'
}

let showing: Part | null = null
let showingName: PageName = 'landing'
let heldAddress: string | null = null

function show(name: PageName, built: Part): void {
  showing?.teardown()
  showing = built
  showingName = name
  document.body.dataset.showing = name
  hand.wear(moodForPage[name])
  stage.replaceChildren(built.element)
  window.scrollTo({ top: 0 })
}

function showLanding(): void {
  show(
    'landing',
    buildLanding({
      purse: raiderPurse,
      whenHallOpens(reading) {
        if (reading.address) {
          heldAddress = reading.address
          showHall(reading.address)
        }
      }
    })
  )
}

function showHall(address: string): void {
  show(
    'hall',
    buildHall({
      address,
      whenRoleAsked(role) {
        void goToRole(role)
      },
      whenDescending(pact, chosenClass) {
        void showDescent(pact, chosenClass)
      }
    })
  )
}

async function goToRole(role: Role): Promise<void> {
  if (role === 'raider') {
    const reading =
      raiderPurse.read().standing === 'opened'
        ? raiderPurse.read()
        : await raiderPurse.moveToWantedRealm()

    if (reading.address) {
      heldAddress = reading.address
      showHall(reading.address)
    }
    return
  }

  const opened =
    patronPurse.read().standing === 'opened' ? patronPurse.read() : await patronPurse.open()

  const reading =
    opened.standing === 'opened' ? opened : await patronPurse.moveToWantedRealm()

  if (reading.address) {
    showPatronTable(reading.address)
  }
}

function showPatronTable(address: string): void {
  show(
    'patron',
    buildPatronTable({
      purse: patronPurse,
      address,
      whenRoleAsked(role) {
        void goToRole(role)
      }
    })
  )
}

async function showDescent(pact: Pact, chosenClass: RaiderClass): Promise<void> {
  const seed = await seedForTheDescent()

  show(
    'descent',
    buildDescent({
      pact,
      chosenClass,
      standing: 720,
      seed,
      whenSettled() {
        if (heldAddress) {
          showHall(heldAddress)
        } else {
          showLanding()
        }
      }
    })
  )
}

showLanding()

raiderPurse.watch((reading) => {
  if ((showingName === 'hall' || showingName === 'descent') && reading.standing !== 'opened') {
    showLanding()
  }
})

void loadWhatYouCan(everyPieceOfArt)
