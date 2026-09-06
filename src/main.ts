import './styles/theme.css'
import './styles/marks.css'
import './styles/frame.css'
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
let changingRole = false

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
        return goToRole(role)
      },
      whenDescending(pact, chosenClass) {
        void showDescent(pact, chosenClass)
      }
    })
  )
}

const whyItFailed: Record<string, string> = {
  'no purse found': 'no purse to sign with',
  'you refused': 'you turned the switch away',
  'wrong realm': 'your purse stayed where it was',
  'something broke': 'the purse would not answer'
}

async function goToRole(role: Role): Promise<string | null> {
  if (changingRole) {
    return null
  }

  changingRole = true

  try {
    const purse = role === 'raider' ? raiderPurse : patronPurse
    const wanted = role === 'raider' ? homeRealm : realmWherePatronsPay

    const known = purse.read()
    const opened = known.standing === 'opened' ? known : await purse.open()
    const reading = opened.standing === 'opened' ? opened : await purse.moveToWantedRealm()

    if (reading.standing !== 'opened' || !reading.address) {
      const said = whyItFailed[reading.standing] ?? 'could not reach that side'
      return `${said} — ${role} sits on ${wanted.name}`
    }

    if (role === 'raider') {
      heldAddress = reading.address
      showHall(reading.address)
    } else {
      showPatronTable(reading.address)
    }

    return null
  } finally {
    changingRole = false
  }
}

function showPatronTable(address: string): void {
  show(
    'patron',
    buildPatronTable({
      purse: patronPurse,
      address,
      whenRoleAsked(role) {
        return goToRole(role)
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
      whenWayOutOpens(open: boolean) {
        hand.wear(open ? 'wayOut' : 'enemy')
      },
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
  if (changingRole) {
    return
  }
  if ((showingName === 'hall' || showingName === 'descent') && reading.standing !== 'opened') {
    showLanding()
  }
})

void loadWhatYouCan(everyPieceOfArt)
