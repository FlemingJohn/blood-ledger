import type { Profile } from '../types/profile'
import { readRaider } from './theLedger'
import { deedsOf, patronRecordOf, raiderRecordOf } from './whatYouHaveDone'

export function readProfile(address: string): Profile {
  const you = readRaider(address)

  return {
    address,
    chosenClass: you.chosenClass,
    standing: you.standing,
    asRaider: raiderRecordOf(address),
    asPatron: patronRecordOf(address),
    deeds: deedsOf(address)
  }
}
