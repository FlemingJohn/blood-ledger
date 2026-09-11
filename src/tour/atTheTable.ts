import type { TourStep } from '../types/tour'
import { acrossTheHeader } from './theHeader'

export function aroundTheTable(): TourStep[] {
  return [
    ...acrossTheHeader(),
    {
      at: '.stake',
      mark: 'coin',
      title: 'Putting up the coin',
      said: 'Whose address is going down, how much, and what share of the haul you keep. This pays on Ethereum, because that is where the money is. Nothing reaches your wallet until you have read the slab that comes next.',
      side: 'right',
      align: 'start'
    },
    {
      at: '.whois',
      mark: 'seal',
      title: 'The ledger answers as you type',
      said: 'That card came off Creditcoin just now. Their title, their score, how many they repaid and how many they cost. If they already owe somebody it says so, and if you have backed them before it tells you how much less a second raid earns them.',
      side: 'right'
    },
    {
      at: '.board',
      mark: 'scales',
      title: 'Everyone the ledger knows',
      said: 'Not people asking for money, because a raider has no way to ask. This is every address the ledger has ever seen, sorted by standing, with a real record. Somebody who already owes gets no button, because the contract would refuse that pact anyway.',
      side: 'left',
      align: 'start'
    },
    {
      at: '.stake__made',
      mark: 'purse',
      title: 'What you have staked',
      said: 'Each one links to its transaction on Sepolia. From the moment it lands you wait about nine minutes for the witnesses to agree, and only then can the raider descend.',
      side: 'right',
      align: 'end'
    }
  ]
}
