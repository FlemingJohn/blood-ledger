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

export function coinDrops(): void {
  const at = rightNow()
  tone('triangle', at, 0.11, 1560, 1540, 0.12)
  tone('triangle', at + 0.015, 0.16, 2340, 2300, 0.07)
  tone('sine', at + 0.06, 0.14, 190, 110, 0.14)
}

export function coinPoured(): void {
  const at = rightNow()
  for (let step = 0; step < 5; step += 1) {
    const when = at + step * 0.045 + Math.random() * 0.02
    tone('triangle', when, 0.1, 1300 + Math.random() * 900, 1200, 0.075)
  }
  tone('sine', at + 0.1, 0.26, 150, 80, 0.16)
}

export function waxPressed(): void {
  const at = rightNow()
  burstOfHiss(at, 0.13, 900, 260, 0.2)
  tone('sine', at + 0.02, 0.24, 150, 90, 0.2)
}

export function boltDrawn(): void {
  const at = rightNow()
  burstOfHiss(at, 0.16, 2200, 900, 0.16)
  tone('square', at + 0.05, 0.08, 260, 250, 0.09)
  tone('sine', at + 0.14, 0.7, 110, 52, 0.24)
}

export function scaleTips(): void {
  const at = rightNow()
  tone('triangle', at, 0.16, 880, 660, 0.1)
  tone('triangle', at + 0.09, 0.22, 660, 588, 0.08)
}

export function bladeDrawn(): void {
  const at = rightNow()
  burstOfHiss(at, 0.2, 1800, 4200, 0.16)
  tone('triangle', at + 0.04, 0.22, 1320, 1760, 0.07)
}

export function armourShifts(): void {
  const at = rightNow()
  burstOfHiss(at, 0.1, 1400, 500, 0.14)
  tone('square', at, 0.06, 190, 170, 0.06)
}

export function chainHauls(): void {
  const at = rightNow()
  for (let step = 0; step < 4; step += 1) {
    const when = at + step * 0.085
    tone('square', when, 0.05, 420 + step * 40, 380 + step * 40, 0.055)
    burstOfHiss(when, 0.06, 2400, 1100, 0.08)
  }
}

export function stoneGrinds(): void {
  const at = rightNow()
  burstOfHiss(at, 0.7, 320, 120, 0.2)
  tone('sine', at, 0.8, 74, 46, 0.2)
}

export function pageTurns(): void {
  const at = rightNow()
  burstOfHiss(at, 0.16, 3400, 1300, 0.11)
}

export function latchClicks(): void {
  const at = rightNow()
  tone('square', at, 0.035, 620, 560, 0.06)
  burstOfHiss(at, 0.04, 2800, 1600, 0.07)
}

export function doorWontBudge(): void {
  const at = rightNow()
  tone('sine', at, 0.2, 120, 96, 0.22)
  burstOfHiss(at, 0.1, 500, 180, 0.12)
}
