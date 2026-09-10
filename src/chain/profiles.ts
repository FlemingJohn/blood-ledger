import type { Profile } from '../types/profile'
import { readRaider } from './theLedger'
import { deedsOf, patronRecordOf, raiderRecordOf } from './whatYouHaveDone'
import { readWhatTheChainRemembers } from './whatTheChainRemembers'
import { howYourRaidsWent } from './yourOwnMemory'

export function readProfile(address: string): Profile {
  const you = readRaider(address)
  const yours = howYourRaidsWent(address)
  const asRaider = raiderRecordOf(address)

  return {
    address,
    chosenClass: you.chosenClass,
    standing: you.standing,
    asRaider: {
      ...asRaider,
      deepestFloor: Math.max(asRaider.deepestFloor, yours.deepestFloor),
      bestHaul: Math.max(asRaider.bestHaul, yours.bestHaul)
    },
    asPatron: patronRecordOf(address),
    deeds: deedsOf(address)
  }
}

export async function readProfileFromTheChain(address: string): Promise<Profile | null> {
  const told = await readWhatTheChainRemembers(address)

  if (!told) {
    return null
  }

  const here = readProfile(address)

  return {
    ...here,
    asRaider: {
      ...here.asRaider,
      coinKept: told.coinKept,
      defaults: here.standing.lost
    },
    asPatron: told.asPatron,
    deeds: told.deeds
  }
}
