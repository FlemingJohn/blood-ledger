const keptUnder = 'blood-ledger:how-your-raids-went'

export interface HowYourRaidsWent {
  deepestFloor: number
  bestHaul: number
}

const nothingYet: HowYourRaidsWent = { deepestFloor: 0, bestHaul: 0 }

type Everyone = Record<string, HowYourRaidsWent>

function readTheLot(): Everyone {
  try {
    const held = window.localStorage.getItem(keptUnder)
    return held ? (JSON.parse(held) as Everyone) : {}
  } catch {
    return {}
  }
}

function writeTheLot(everyone: Everyone): void {
  try {
    window.localStorage.setItem(keptUnder, JSON.stringify(everyone))
  } catch {
    return
  }
}

export function howYourRaidsWent(address: string): HowYourRaidsWent {
  const held = readTheLot()[address.toLowerCase()]
  return held ? { ...held } : { ...nothingYet }
}

export function rememberHowItWent(
  address: string,
  floorReached: number,
  coinsCarried: number
): void {
  const everyone = readTheLot()
  const key = address.toLowerCase()
  const held = everyone[key] ?? { ...nothingYet }

  everyone[key] = {
    deepestFloor: Math.max(held.deepestFloor, floorReached),
    bestHaul: Math.max(held.bestHaul, coinsCarried)
  }

  writeTheLot(everyone)
}
