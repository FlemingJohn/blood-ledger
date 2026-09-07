import { hiss, rightNow, tapFor, theBox } from './theBox'

function burstOfHiss(from: number, lasts: number, cutFrom: number, cutTo: number, loud: number): void {
  const box = theBox()
  const tap = tapFor('blows')
  const grain = hiss()

  if (!box || !tap || !grain) {
    return
  }

  const source = box.createBufferSource()
  source.buffer = grain
  source.loop = true

  const sieve = box.createBiquadFilter()
  sieve.type = 'bandpass'
  sieve.frequency.setValueAtTime(cutFrom, from)
  sieve.frequency.exponentialRampToValueAtTime(Math.max(60, cutTo), from + lasts)
  sieve.Q.value = 1.1

  const swell = box.createGain()
  swell.gain.setValueAtTime(0, from)
  swell.gain.linearRampToValueAtTime(loud, from + 0.008)
  swell.gain.exponentialRampToValueAtTime(0.0001, from + lasts)

  source.connect(sieve)
  sieve.connect(swell)
  swell.connect(tap)

  source.start(from)
  source.stop(from + lasts + 0.05)
}

function tone(
  shape: OscillatorType,
  from: number,
  lasts: number,
  pitchFrom: number,
  pitchTo: number,
  loud: number,
  detune = 0
): void {
  const box = theBox()
  const tap = tapFor('blows')

  if (!box || !tap) {
    return
  }

  const voice = box.createOscillator()
  voice.type = shape
  voice.detune.value = detune
  voice.frequency.setValueAtTime(pitchFrom, from)
  voice.frequency.exponentialRampToValueAtTime(Math.max(20, pitchTo), from + lasts)

  const swell = box.createGain()
  swell.gain.setValueAtTime(0, from)
  swell.gain.linearRampToValueAtTime(loud, from + 0.012)
  swell.gain.exponentialRampToValueAtTime(0.0001, from + lasts)

  voice.connect(swell)
  swell.connect(tap)

  voice.start(from)
  voice.stop(from + lasts + 0.05)
}

function run(notes: number[], from: number, gap: number, lasts: number, loud: number, shape: OscillatorType): void {
  notes.forEach((pitch, step) => {
    tone(shape, from + step * gap, lasts, pitch, pitch, loud)
  })
}

export function bladeLands(): void {
  const at = rightNow()
  burstOfHiss(at, 0.09, 2600, 700, 0.34)
  tone('triangle', at, 0.07, 340, 150, 0.16)
}

export function enemyFalls(): void {
  const at = rightNow()
  burstOfHiss(at, 0.3, 1500, 220, 0.26)
  tone('sawtooth', at + 0.02, 0.32, 220, 70, 0.2)
}

export function youAreHit(): void {
  const at = rightNow()
  tone('sine', at, 0.22, 180, 80, 0.4)
  burstOfHiss(at, 0.12, 700, 200, 0.2)
}

export function youFall(): void {
  const at = rightNow()
  tone('sawtooth', at, 1.5, 260, 32, 0.34)
  tone('sine', at + 0.05, 1.4, 130, 24, 0.28)
  burstOfHiss(at, 0.9, 900, 90, 0.16)
}

export function coinTaken(): void {
  const at = rightNow()
  tone('triangle', at, 0.09, 1180, 1180, 0.16)
  tone('triangle', at + 0.07, 0.13, 1760, 1760, 0.14)
}

export function cleaveSwings(): void {
  const at = rightNow()
  burstOfHiss(at, 0.24, 500, 3200, 0.28)
}

export function bulwarkHolds(): void {
  const at = rightNow()
  tone('square', at, 0.5, 440, 430, 0.1)
  tone('square', at, 0.5, 660, 648, 0.07, 8)
  tone('sine', at, 0.6, 220, 218, 0.12)
}

export function demonlordLaughs(): void {
  const at = rightNow()
  const box = theBox()
  const tap = tapFor('blows')

  if (!box || !tap) {
    return
  }

  const voice = box.createOscillator()
  voice.type = 'sawtooth'
  voice.frequency.value = 78

  const wobble = box.createOscillator()
  wobble.type = 'sine'
  wobble.frequency.value = 5.5

  const depth = box.createGain()
  depth.gain.value = 22

  const sieve = box.createBiquadFilter()
  sieve.type = 'lowpass'
  sieve.frequency.value = 520

  const swell = box.createGain()
  swell.gain.setValueAtTime(0, at)
  swell.gain.linearRampToValueAtTime(0.3, at + 0.12)
  swell.gain.setValueAtTime(0.3, at + 1.4)
  swell.gain.exponentialRampToValueAtTime(0.0001, at + 2.1)

  wobble.connect(depth)
  depth.connect(voice.frequency)
  voice.connect(sieve)
  sieve.connect(swell)
  swell.connect(tap)

  voice.start(at)
  wobble.start(at)
  voice.stop(at + 2.2)
  wobble.stop(at + 2.2)
}

export function pactSeals(): void {
  run([392, 523, 659], rightNow(), 0.11, 0.3, 0.16, 'triangle')
}

export function stairOpens(): void {
  const at = rightNow()
  tone('sine', at, 1.6, 90, 40, 0.36)
  burstOfHiss(at, 0.5, 400, 100, 0.12)
}

export function youWalkedOut(): void {
  run([392, 494, 587, 784], rightNow(), 0.15, 0.55, 0.16, 'triangle')
}

export function youWereLost(): void {
  run([392, 349, 294, 196], rightNow(), 0.19, 0.7, 0.16, 'sawtooth')
}
