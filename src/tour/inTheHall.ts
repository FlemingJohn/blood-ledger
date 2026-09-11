import type { TourStep } from '../types/tour'
import { acrossTheHeader } from './theHeader'

export function aroundTheHall(): TourStep[] {
  return [
    ...acrossTheHeader(),
    {
      at: '.board',
      mark: 'coin',
      title: 'Somebody has to name you',
      said: 'There is no wall of strangers offering money here. A patron names the raider when they pay, so this board only holds coin put up in your name. If it is bare, ask the House.',
      side: 'right',
      align: 'start'
    },
    {
      at: '.bay--underwriter',
      mark: 'scales',
      title: 'A lender has already read you',
      said: 'The Underwriter decided what you are worth before you arrived. Plain arithmetic did that, weighing eight things that should worry a lender. A language model wrote the sentence and nothing else.',
      side: 'bottom'
    },
    {
      at: '.plinth',
      mark: 'blade',
      title: 'Pick who goes down',
      said: 'Warrior, Knight or Fighter. Each brings two powers and a different amount of life. Whoever you choose is remembered against your address.',
      side: 'left'
    },
    {
      at: '.rail__block--bond',
      mark: 'shield',
      title: 'What you must lock up',
      said: 'Before you may descend you lock up a bond in your own coin. It falls as your standing rises, and at 900 you post nothing at all, because your name is the collateral. Walk out and it comes back whole. Fall and it goes to the patron you cost.',
      side: 'left'
    },
    {
      at: '.stairway',
      mark: 'stair',
      title: 'The stair',
      said: 'Press this and your wallet will ask you for the bond, on Creditcoin. Nothing comes back for you after that.',
      side: 'top',
      align: 'end'
    }
  ]
}
