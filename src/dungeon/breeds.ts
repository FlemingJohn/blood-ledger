import type { Breed, BreedName } from '../types/breed'
import type { Rolls } from './seed'

export const breeds: Record<BreedName, Breed> = {
  skeleton: {
    name: 'skeleton',
    said: 'Skeleton',
    drawnAs: 'skeleton',
    life: 40,
    hurts: 9,
    reach: 62,
    pace: 74,
    swell: 1,
    tint: null,
    coinBonus: 0,
    fromFloor: 1,
    rarity: 1
  },
  boneChampion: {
    name: 'boneChampion',
    said: 'Bone Champion',
    drawnAs: 'skeleton',
    life: 90,
    hurts: 16,
    reach: 70,
    pace: 68,
    swell: 1.35,
    tint: 'sepia(1) saturate(6) hue-rotate(-25deg) brightness(1.15)',
    coinBonus: 40,
    fromFloor: 2,
    rarity: 0.34
  },
  frostRisen: {
    name: 'frostRisen',
    said: 'Frost Risen',
    drawnAs: 'skeleton',
    life: 40,
    hurts: 7,
    reach: 66,
    pace: 96,
    swell: 1,
    tint: 'sepia(1) saturate(4) hue-rotate(165deg) brightness(1.2)',
    coinBonus: 15,
    fromFloor: 2,
    rarity: 0.4
  },
  gildedDead: {
    name: 'gildedDead',
    said: 'Gilded Dead',
    drawnAs: 'skeleton',
    life: 60,
    hurts: 10,
    reach: 62,
    pace: 74,
    swell: 1.15,
    tint: 'sepia(1) saturate(5) hue-rotate(-8deg) brightness(1.3)',
    coinBonus: 120,
    fromFloor: 2,
    rarity: 0.24
  },
  slime: {
    name: 'slime',
    said: 'Slime',
    drawnAs: 'slime',
    life: 26,
    hurts: 6,
    reach: 52,
    pace: 46,
    swell: 1,
    tint: null,
    coinBonus: 0,
    fromFloor: 1,
    rarity: 1
  },
  kingSlime: {
    name: 'kingSlime',
    said: 'King Slime',
    drawnAs: 'slime',
    life: 140,
    hurts: 12,
    reach: 70,
    pace: 32,
    swell: 1.85,
    tint: 'sepia(1) saturate(3) hue-rotate(60deg) brightness(1.15)',
    coinBonus: 90,
    fromFloor: 3,
    rarity: 0.22
  },
  bloodSlime: {
    name: 'bloodSlime',
    said: 'Blood Slime',
    drawnAs: 'slime',
    life: 45,
    hurts: 9,
    reach: 54,
    pace: 108,
    swell: 1.25,
    tint: 'sepia(1) saturate(7) hue-rotate(-30deg) brightness(1.1)',
    coinBonus: 30,
    fromFloor: 2,
    rarity: 0.36
  },
  lesserDemon: {
    name: 'lesserDemon',
    said: 'Lesser Demon',
    drawnAs: 'demonlord',
    life: 110,
    hurts: 15,
    reach: 78,
    pace: 84,
    swell: 0.55,
    tint: 'grayscale(.55) brightness(1.25)',
    coinBonus: 160,
    fromFloor: 4,
    rarity: 0.18
  },
  demonlord: {
    name: 'demonlord',
    said: 'Demonlord',
    drawnAs: 'demonlord',
    life: 320,
    hurts: 22,
    reach: 104,
    pace: 92,
    swell: 1,
    tint: null,
    coinBonus: 900,
    fromFloor: 3,
    rarity: 1
  }
}

const boneKin: BreedName[] = ['skeleton', 'boneChampion', 'frostRisen', 'gildedDead']
const oozeKin: BreedName[] = ['slime', 'kingSlime', 'bloodSlime']

function chooseFrom(kin: BreedName[], floor: number, rolls: Rolls): Breed {
  const allowed = kin
    .map((name) => breeds[name])
    .filter((breed) => breed.fromFloor <= floor)

  const shuffled = allowed.slice().sort(() => rolls.next() - 0.5)

  for (const breed of shuffled) {
    if (breed.rarity < 1 && rolls.chance(breed.rarity)) {
      return breed
    }
  }

  return breeds[kin[0] as BreedName]
}

export function pickBreed(floor: number, rolls: Rolls): Breed {
  if (floor >= breeds.lesserDemon.fromFloor && rolls.chance(breeds.lesserDemon.rarity)) {
    return breeds.lesserDemon
  }
  return rolls.chance(0.65) ? chooseFrom(boneKin, floor, rolls) : chooseFrom(oozeKin, floor, rolls)
}
