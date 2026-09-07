import type { SoundChannel, SoundSettings } from '../types/sound'

const remembered = 'bloodledger.sound'

const asHeard: SoundSettings = {
  everything: 0.8,
  blows: 0.75,
  dark: 0.4
}

let box: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

const taps: Record<SoundChannel, GainNode | null> = { blows: null, dark: null }
const listeners = new Set<(settings: SoundSettings) => void>()

let settings: SoundSettings = { ...asHeard }

function recall(): void {
  try {
    const said = window.localStorage.getItem(remembered)
    if (!said) {
      return
    }
    const kept = JSON.parse(said) as Partial<SoundSettings>
    settings = {
      everything: typeof kept.everything === 'number' ? kept.everything : asHeard.everything,
      blows: typeof kept.blows === 'number' ? kept.blows : asHeard.blows,
      dark: typeof kept.dark === 'number' ? kept.dark : asHeard.dark
    }
  } catch {
    settings = { ...asHeard }
  }
}

function keep(): void {
  try {
    window.localStorage.setItem(remembered, JSON.stringify(settings))
  } catch {
    return
  }
}

function turnTheTaps(): void {
  if (!master) {
    return
  }
  master.gain.value = settings.everything
  if (taps.blows) {
    taps.blows.gain.value = settings.blows
  }
  if (taps.dark) {
    taps.dark.gain.value = settings.dark
  }
}

function fillWithHiss(inside: AudioContext): AudioBuffer {
  const long = Math.round(inside.sampleRate * 1.2)
  const made = inside.createBuffer(1, long, inside.sampleRate)
  const held = made.getChannelData(0)

  for (let at = 0; at < long; at += 1) {
    held[at] = Math.random() * 2 - 1
  }

  return made
}

recall()

export function openTheBox(): void {
  if (box) {
    void box.resume()
    return
  }

  const Maker = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!Maker) {
    return
  }

  try {
    box = new Maker()
  } catch {
    box = null
    return
  }

  master = box.createGain()
  master.connect(box.destination)

  taps.blows = box.createGain()
  taps.blows.connect(master)

  taps.dark = box.createGain()
  taps.dark.connect(master)

  noise = fillWithHiss(box)
  turnTheTaps()

  opened.forEach((listener) => listener())
}

const opened = new Set<() => void>()

export function whenTheBoxOpens(listener: () => void): () => void {
  if (box) {
    listener()
  }
  opened.add(listener)
  return () => {
    opened.delete(listener)
  }
}

export function theBox(): AudioContext | null {
  return box
}

export function tapFor(channel: SoundChannel): GainNode | null {
  return taps[channel]
}

export function hiss(): AudioBuffer | null {
  return noise
}

export function rightNow(): number {
  return box ? box.currentTime : 0
}

export function readSound(): SoundSettings {
  return { ...settings }
}

export function setSound(next: Partial<SoundSettings>): void {
  settings = { ...settings, ...next }
  turnTheTaps()
  keep()
  listeners.forEach((listener) => listener({ ...settings }))
}

export function whenSoundChanges(listener: (settings: SoundSettings) => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
