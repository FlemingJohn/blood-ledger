import './styles/theme.css'
import type { Part } from './types/parts'
import { keepPurse } from './chain/purse'
import { buildLanding } from './pages/landing'
import { buildHall } from './pages/hall'
import { armThePointer } from './parts/pointer'
import { everyPieceOfArt } from './art/paths'
import { loadWhatYouCan } from './art/pictures'

type PageName = 'landing' | 'hall'

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

function show(name: PageName, built: Part): void {
  showing?.teardown()
  showing = built
  showingName = name
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
        window.console.info('the dungeon is not built yet', pact.offerId)
      }
    })
  )
}

showLanding()

purse.watch((reading) => {
  if (showingName === 'hall' && reading.standing !== 'opened') {
    showLanding()
  }
})

void armThePointer()
void loadWhatYouCan(everyPieceOfArt)
