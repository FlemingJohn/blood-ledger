import type { DoorPart } from '../types/parts'
import type { PurseStanding } from '../types/purse'
import { bladeSweep } from '../art/paths'
import { loadPicture } from '../art/pictures'
import '../styles/door.css'

interface DoorWords {
  word: string
  aside: string
  flavour: 'plain' | 'wrong-realm' | 'opened'
  waiting: boolean
}

const wordsForStanding: Record<PurseStanding, DoorWords> = {
  'no purse found': {
    word: 'Get a Purse',
    aside: 'You need MetaMask before anyone will fund you',
    flavour: 'plain',
    waiting: false
  },
  'ready to open': {
    word: 'Open Your Purse',
    aside: 'No coin is spent here',
    flavour: 'plain',
    waiting: false
  },
  'waiting on you': {
    word: 'Check Your Purse',
    aside: 'Your purse is asking you a question',
    flavour: 'plain',
    waiting: true
  },
  'wrong realm': {
    word: 'Step Into Creditcoin',
    aside: 'Your purse is standing in another realm',
    flavour: 'wrong-realm',
    waiting: false
  },
  opened: {
    word: 'Enter the Hall',
    aside: 'The patrons are waiting',
    flavour: 'opened',
    waiting: false
  },
  'you refused': {
    word: 'Open Your Purse',
    aside: 'You turned away. Try again when you are ready',
    flavour: 'plain',
    waiting: false
  },
  'something broke': {
    word: 'Try the Door Again',
    aside: 'The purse would not answer',
    flavour: 'plain',
    waiting: false
  }
}

export function buildDoor(): DoorPart {
  const doorway = document.createElement('div')
  doorway.className = 'doorway'

  const door = document.createElement('button')
  door.type = 'button'
  door.className = 'door'

  const word = document.createElement('span')
  word.className = 'door__word'
  door.append(word)

  const aside = document.createElement('p')
  aside.className = 'doorway__aside'

  doorway.append(door, aside)

  loadPicture(bladeSweep[3] ?? '')
    .then((picture) => {
      const sweep = document.createElement('img')
      sweep.className = 'door__sweep'
      sweep.src = picture.src
      sweep.alt = ''
      sweep.setAttribute('aria-hidden', 'true')
      door.append(sweep)
    })
    .catch(() => undefined)

  const listeners = new Set<() => void>()
  door.addEventListener('click', () => listeners.forEach((listener) => listener()))

  return {
    element: doorway,

    showStanding(standing: PurseStanding): void {
      const chosen = wordsForStanding[standing]
      word.textContent = chosen.word
      door.disabled = chosen.waiting
      door.classList.toggle('door--wrong-realm', chosen.flavour === 'wrong-realm')
      door.classList.toggle('door--opened', chosen.flavour === 'opened')
      aside.textContent = chosen.aside
      aside.classList.remove('doorway__aside--trouble')
    },

    whenPushed(listener: () => void): void {
      listeners.add(listener)
    },

    teardown(): void {
      listeners.clear()
      doorway.remove()
    }
  }
}
