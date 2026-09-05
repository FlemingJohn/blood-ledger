export interface Rolls {
  next(): number
  between(lowest: number, highest: number): number
  pick<Thing>(things: Thing[]): Thing
  chance(likelihood: number): boolean
}

export function rollsFromSeed(seed: string): Rolls {
  let state = 0x811c9dc5

  for (let place = 0; place < seed.length; place += 1) {
    state ^= seed.charCodeAt(place)
    state = Math.imul(state, 0x01000193) >>> 0
  }

  if (state === 0) {
    state = 0x9e3779b9
  }

  function next(): number {
    state ^= state << 13
    state >>>= 0
    state ^= state >>> 17
    state ^= state << 5
    state >>>= 0
    return state / 0x100000000
  }

  return {
    next,

    between(lowest: number, highest: number): number {
      return lowest + next() * (highest - lowest)
    },

    pick<Thing>(things: Thing[]): Thing {
      const chosen = things[Math.floor(next() * things.length)]
      if (chosen === undefined) {
        throw new Error('cannot pick from an empty list')
      }
      return chosen
    },

    chance(likelihood: number): boolean {
      return next() < likelihood
    }
  }
}

export function madeUpSeed(): string {
  const parts = Array.from({ length: 8 }, () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0')
  )
  return `0x${parts.join('')}`
}

export function shortSeed(seed: string): string {
  return seed.length <= 12 ? seed : `${seed.slice(0, 6)}…${seed.slice(-4)}`
}
