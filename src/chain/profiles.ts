import type { Deed, PatronRecord, Profile, RaiderRecord } from '../types/profile'
import { readRaider } from './theLedger'

const raiderSoFar: RaiderRecord = {
  deepestFloor: 5,
  bestHaul: 1850,
  coinKept: 4210,
  defaults: 1
}

const patronSoFar: PatronRecord = {
  backed: 7,
  returned: 5,
  lost: 2,
  profit: 1340
}

const deedsSoFar: Deed[] = [
  {
    side: 'raider',
    outcome: 'walked out',
    floorReached: 3,
    coinChange: 1110,
    otherSide: '0x44AB000000000000000000000000000000000009',
    minutesAgo: 11
  },
  {
    side: 'patron',
    outcome: 'walked out',
    floorReached: 4,
    coinChange: 420,
    otherSide: '0x2F88000000000000000000000000000000000012',
    minutesAgo: 23
  },
  {
    side: 'raider',
    outcome: 'fell',
    floorReached: 2,
    coinChange: -300,
    otherSide: '0xBEEF00000000000000000000000000000000CA12',
    minutesAgo: 46
  },
  {
    side: 'patron',
    outcome: 'fell',
    floorReached: 1,
    coinChange: -260,
    otherSide: '0x91C2000000000000000000000000000000000004',
    minutesAgo: 90
  },
  {
    side: 'raider',
    outcome: 'walked out',
    floorReached: 5,
    coinChange: 1850,
    otherSide: '0x7E11000000000000000000000000000000000031',
    minutesAgo: 132
  }
]

export function readProfile(address: string): Profile {
  const you = readRaider(address)

  return {
    address,
    chosenClass: you.chosenClass,
    standing: you.standing,
    asRaider: { ...raiderSoFar },
    asPatron: { ...patronSoFar },
    deeds: deedsSoFar.map((deed) => ({ ...deed }))
  }
}
