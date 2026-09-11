import type { TourStep } from '../types/tour'

export function acrossTheHeader(): TourStep[] {
  return [
    {
      at: '.tally__bay--standing',
      mark: 'scales',
      title: 'Your name is the collateral',
      said: 'This is not a score the page invented. It is read from the ledger on Creditcoin, and anyone can read it too. Clear a debt and it climbs 28. Fall and it drops 86. Click your face for the whole record.',
      side: 'bottom',
      align: 'start'
    },
    {
      at: '.bay--witnesses',
      mark: 'seal',
      title: 'Somebody is watching Ethereum',
      said: 'These numbers are live. A group of witnesses watch Ethereum and write down what they saw on Creditcoin. How far behind they are is how long a new pact takes to become real.',
      side: 'bottom'
    },
    {
      at: '.tally__bay--role',
      mark: 'shield',
      title: 'Two sides of the same game',
      said: 'Raiders borrow. Patrons lend. You can be either, and flipping this moves your purse between chains, because the money lives on Ethereum and the reputation lives on Creditcoin.',
      side: 'bottom'
    },
    {
      at: '.tally__bay--purse',
      mark: 'purse',
      title: 'Your purse, and the House',
      said: 'What you hold, and which chain you are standing on. This corner turns red when you are on the wrong one. The small purse icon is the House: press it and it will fill an empty wallet, so you never have to go hunting for a faucet.',
      side: 'bottom',
      align: 'end'
    }
  ]
}
