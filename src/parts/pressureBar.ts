import type { Part } from '../types/parts'
import { countCoins } from '../chain/addresses'
import { realmWherePatronsPay } from '../chain/realms'
import { shortSeed } from '../dungeon/seed'

export interface PressureBarPart extends Part {
  showFloor(floor: number): void
  showCoins(carried: number, owed: number): void
  showSlain(slain: number): void
}

export function hangThePressureBar(seed: string): PressureBarPart {
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

  const proof = document.createElement('a')
  proof.className = 'pressure__seed'
  proof.href = `${realmWherePatronsPay.explorerAddress}/block/${seed}`
  proof.target = '_blank'
  proof.rel = 'noopener'
  proof.textContent = `seed ${shortSeed(seed)}`
  proof.title = 'The floor was rolled from this Ethereum block. Open it and check.'

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
