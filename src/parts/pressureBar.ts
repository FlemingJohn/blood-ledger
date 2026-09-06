import type { Part } from '../types/parts'
import type { DungeonSeed } from '../types/attestation'
import { countCoins } from '../chain/addresses'
import { whereToCheckIt } from '../chain/attestedSeed'
import { shortSeed } from '../dungeon/seed'

export interface PressureBarPart extends Part {
  showFloor(floor: number): void
  showCoins(carried: number, owed: number): void
  showSlain(slain: number): void
}

export function hangThePressureBar(seed: DungeonSeed): PressureBarPart {
  const bar = document.createElement('div')
  bar.className = 'pressure'

  const floorMark = document.createElement('span')
  floorMark.className = 'pressure__floor'

  const slainMark = document.createElement('span')
  slainMark.className = 'pressure__slain'

  const purse = document.createElement('span')
  purse.className = 'pressure__purse'

  const carried = document.createElement('b')
  const owed = document.createElement('span')
  owed.className = 'pressure__owed'

  purse.append(carried, owed)

  const attestedElsewhere = whereToCheckIt(seed.attested)

  const proof = document.createElement(attestedElsewhere ? 'a' : 'span')
  proof.className = `pressure__seed pressure__seed--${seed.source === 'attested' ? 'proved' : 'guessed'}`
  proof.textContent =
    seed.source === 'attested'
      ? `attested block ${seed.attested?.height} · ${shortSeed(seed.seed)}`
      : `unattested seed ${shortSeed(seed.seed)}`

  if (attestedElsewhere && proof instanceof HTMLAnchorElement) {
    proof.href = attestedElsewhere
    proof.target = '_blank'
    proof.rel = 'noopener'
    proof.title =
      'This floor was rolled from a Sepolia block the Attestcoin witnesses agreed on. Open it and check.'
  } else {
    proof.title = 'Creditcoin could not be reached, so this floor was rolled locally.'
  }

  bar.append(floorMark, slainMark, purse, proof)

  return {
    element: bar,

    showFloor(floor: number): void {
      floorMark.textContent = `Floor ${floor}`
    },

    showSlain(slain: number): void {
      slainMark.textContent = `${slain} slain`
    },

    showCoins(carriedNow: number, owedNow: number): void {
      carried.textContent = countCoins(carriedNow)
      carried.className = carriedNow >= owedNow ? 'pressure__clear' : 'pressure__short'
      owed.textContent = `owed ${countCoins(owedNow)}`
    },

    teardown(): void {
      bar.remove()
    }
  }
}
