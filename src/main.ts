import './styles/theme.css'
import { keepPurse } from './chain/purse'
import { buildLanding } from './pages/landing'
import { armThePointer } from './parts/pointer'
import { everyPieceOfArt } from './art/paths'
import { loadWhatYouCan } from './art/pictures'

const stage = document.querySelector<HTMLDivElement>('#game')

if (!stage) {
  throw new Error('the page is missing its stage')
}

const purse = keepPurse()

const landing = buildLanding({
  purse,
  whenHallOpens(reading) {
    window.console.info('the hall is not built yet', reading.address)
  }
})

stage.append(landing.element)

void armThePointer()
void loadWhatYouCan(everyPieceOfArt)
