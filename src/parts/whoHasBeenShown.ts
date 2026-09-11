const keptUnder = 'blood-ledger:what-you-have-been-shown'

export type TourName = 'the hall' | 'the dungeon' | 'the table'

type Everyone = Record<string, TourName[]>

function readTheLot(): Everyone {
  try {
    const held = window.localStorage.getItem(keptUnder)
    return held ? (JSON.parse(held) as Everyone) : {}
  } catch {
    return {}
  }
}

export function haveYouSeen(address: string, which: TourName): boolean {
  const shown = readTheLot()[address.toLowerCase()]
  return Array.isArray(shown) && shown.includes(which)
}

export function markAsShown(address: string, which: TourName): void {
  try {
    const everyone = readTheLot()
    const key = address.toLowerCase()
    const shown = everyone[key] ?? []

    if (!shown.includes(which)) {
      everyone[key] = [...shown, which]
      window.localStorage.setItem(keptUnder, JSON.stringify(everyone))
    }
  } catch {
    return
  }
}
