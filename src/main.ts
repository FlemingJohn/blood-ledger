import './styles/theme.css'
import type { Part } from './types/parts'
import type { Pact } from './types/pact'
import { keepPurse } from './chain/purse'
import { buildLanding } from './pages/landing'
import { buildHall } from './pages/hall'
import { buildDescent } from './pages/descent'
import { armThePointer } from './parts/pointer'
import { everyPieceOfArt } from './art/paths'
import { loadWhatYouCan } from './art/pictures'
import { madeUpSeed } from './dungeon/seed'

type PageName = 'landing' | 'hall' | 'descent'

function findStage(): HTMLDivElement {
  const found = document.querySelector<HTMLDivElement>('#game')
  if (!found) {
    throw new Error('the page is missing its stage')
  }
  return found
}

const stage = findStage()

const purse = keepPurse()

let showing: Part | null = null
let showingName: PageName = 'landing'
let heldAddress: string | null = null

function show(name: PageName, built: Part): void {
  showing?.teardown()
  showing = built
  showingName = name
  document.body.dataset.showing = name
  stage.replaceChildren(built.element)
  window.scrollTo({ top: 0 })
}

function showLanding(): void {
  show(
    'landing',
    buildLanding({
      purse,
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
      whenDescending(pact) {
        showDescent(pact)
      }
    })
  )
}

function showDescent(pact: Pact): void {
  show(
    'descent',
    buildDescent({
      pact,
      standing: 720,
      seed: madeUpSeed(),
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

purse.watch((reading) => {
  if (showingName !== 'landing' && reading.standing !== 'opened') {
    showLanding()
  }
})

void armThePointer()
void loadWhatYouCan(everyPieceOfArt)
