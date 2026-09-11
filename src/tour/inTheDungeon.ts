import type { TourStep } from '../types/tour'

export function whenYouArrive(): TourStep[] {
  return [
    {
      at: '.descent__hint',
      mark: 'blade',
      title: 'How to stay alive',
      said: 'W A S D to move. Click or press space to swing. Walk over coin to take it, and swing at barrels to break them open.',
      side: 'top'
    },
    {
      at: '.belt',
      mark: 'shield',
      title: 'Two powers, and they need time',
      said: 'Q and E. The bar under each one drains and refills, so you cannot lean on them. Each champion brings different ones.',
      side: 'top'
    },
    {
      at: '.pressure__seed',
      mark: 'seal',
      title: 'Nobody chose this floor',
      said: 'This map was built from a real Ethereum block, the last one the Attestcoin witnesses agreed on. Not us, not you. That link goes to the block itself.',
      side: 'bottom',
      align: 'end'
    }
  ]
}

export function whenTheDarkArrives(box: HTMLElement): TourStep[] {
  return [
    {
      at: box,
      mark: 'skull',
      title: 'This is what the dark sends',
      said: 'Clearing a floor opens the stair, and the stair stays open. But the dark keeps sending for as long as you stand here, and it sends faster the deeper you are.',
      side: 'top'
    }
  ]
}

export function whenYouFirstCarry(owed: number): TourStep[] {
  return [
    {
      at: '.pressure__purse',
      mark: 'coin',
      title: 'What you carry is what you owe',
      said: `${owed} of somebody else's coin bought your way in. The more of it you are holding, the faster they come for you. The loan is what sets the difficulty.`,
      side: 'bottom'
    }
  ]
}

export function whenYouAreHurt(): TourStep[] {
  return [
    {
      at: '.life',
      mark: 'warning',
      title: 'This does not refill',
      said: 'Whatever life you have left is what you take to the next floor. Going deeper does not heal you.',
      side: 'top',
      align: 'start'
    }
  ]
}

export function whenTheStairOpens(): TourStep[] {
  return [
    {
      at: '.wayout',
      mark: 'stair',
      title: 'The only decision in the game',
      said: 'The stair is open and it stays open. Go deeper for more, or leave with what you have. Leave short of the debt and your standing drops 12. Fall and it drops 86.',
      side: 'top',
      align: 'end'
    }
  ]
}
