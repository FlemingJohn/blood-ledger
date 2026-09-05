import type { Pact } from '../types/pact'
import type { RaidEnding, Takings } from '../types/raid'

const standingForClearing = 28
const standingForDefault = -86
const standingForLeavingShort = -12

export interface SettleOrder {
  pact: Pact
  ending: RaidEnding
  floorReached: number
  coinsCarried: number
  standingBefore: number
  killedBy: string | null
}

export function reckonTheRaid(order: SettleOrder): Takings {
  const lived = order.ending === 'walked out'
  const carried = lived ? order.coinsCarried : 0

  const patronTakes = lived
    ? Math.round((carried * order.pact.patronShare) / 100)
    : order.pact.coinsStaked

  const youKeep = lived ? carried - patronTakes : 0
  const debtCleared = lived && carried >= order.pact.coinsStaked

  const moved = !lived
    ? standingForDefault
    : debtCleared
      ? standingForClearing
      : standingForLeavingShort

  return {
    ending: order.ending,
    floorReached: order.floorReached,
    coinsCarried: lived ? carried : order.coinsCarried,
    patronShare: order.pact.patronShare,
    patronTakes,
    youKeep,
    debtCleared,
    standingBefore: order.standingBefore,
    standingAfter: Math.max(0, Math.min(1000, order.standingBefore + moved)),
    killedBy: order.killedBy
  }
}
