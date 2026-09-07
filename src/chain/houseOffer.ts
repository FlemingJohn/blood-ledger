import type { Offer } from '../types/pact'
import type { HouseOffer } from '../types/house'

const coinsPerEther = 100_000

export const houseOfferId = 'offer-the-house'

export function asAnOffer(house: HouseOffer): Offer {
  return {
    id: houseOfferId,
    patronAddress: house.patronAddress,
    patronName: 'The House',
    coinsStaked: Math.round(Number(house.coinsStaked) * coinsPerEther),
    patronShare: house.patronShare,
    words: `${house.words} ${house.coinsStaked} ${house.coinSymbol} staked on Sepolia.`,
    needsGrade: 'F',
    claimed: false,
    reckoned: false
  }
}
