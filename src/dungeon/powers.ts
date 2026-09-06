import type { Power, PowerName } from '../types/power'
import type { RaiderClass } from '../types/raider'

export const powers: Record<PowerName, Power> = {
  cleave: {
    name: 'cleave',
    said: 'Cleave',
    forClass: 'warrior',
    restsFor: 4200,
    lastsFor: 420,
    costsCoin: 0
  },
  bulwark: {
    name: 'bulwark',
    said: 'Bulwark',
    forClass: 'warrior',
    restsFor: 9000,
    lastsFor: 2600,
    costsCoin: 0
  },
  groundSlam: {
    name: 'groundSlam',
    said: 'Ground Slam',
    forClass: 'knight',
    restsFor: 5200,
    lastsFor: 520,
    costsCoin: 0
  },
  shieldWall: {
    name: 'shieldWall',
    said: 'Shield Wall',
    forClass: 'knight',
    restsFor: 10000,
    lastsFor: 3000,
    costsCoin: 0
  },
  dash: {
    name: 'dash',
    said: 'Dash',
    forClass: 'fighter',
    restsFor: 3200,
    lastsFor: 240,
    costsCoin: 0
  },
  flurry: {
    name: 'flurry',
    said: 'Flurry',
    forClass: 'fighter',
    restsFor: 5600,
    lastsFor: 620,
    costsCoin: 0
  }
}

const bornWith: Record<RaiderClass, PowerName[]> = {
  warrior: ['cleave', 'bulwark'],
  knight: ['groundSlam', 'shieldWall'],
  fighter: ['dash', 'flurry']
}

export function powersFor(chosen: RaiderClass): Power[] {
  return bornWith[chosen].map((name) => powers[name])
}

export const cleaveReaches = 132
export const cleaveSpread = Math.PI * 0.9
export const slamReaches = 168
export const flurryBlows = 3
export const dashLeaps = 190
export const guardCuts = 0.35
