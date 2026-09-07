export interface Given {
  address: string
  times: number
  lastAt: number
}

const given = new Map<string, Given>()

export function whatTheyHaveHad(address: string): Given {
  const key = address.toLowerCase()
  const held = given.get(key)

  if (held) {
    return held
  }

  return { address: key, times: 0, lastAt: 0 }
}

export function writeItDown(address: string): void {
  const had = whatTheyHaveHad(address)

  given.set(address.toLowerCase(), {
    address: address.toLowerCase(),
    times: had.times + 1,
    lastAt: Date.now()
  })
}

export function takeItBack(address: string, wasAt: number): void {
  const key = address.toLowerCase()
  const had = given.get(key)

  if (!had) {
    return
  }

  if (had.times <= 1) {
    given.delete(key)
    return
  }

  given.set(key, { address: key, times: had.times - 1, lastAt: wasAt })
}

export function tooSoonFor(address: string, waitBetween: number): number {
  const had = whatTheyHaveHad(address)

  if (had.lastAt === 0) {
    return 0
  }

  const readyAt = had.lastAt + waitBetween
  const left = readyAt - Date.now()

  return left > 0 ? left : 0
}

export function hadTheirFill(address: string, mostPerAddress: number): boolean {
  return whatTheyHaveHad(address).times >= mostPerAddress
}

export function everyoneGiven(): Given[] {
  return [...given.values()]
}
