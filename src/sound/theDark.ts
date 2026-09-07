import { tapFor, theBox } from './theBox'

const where = '/music/thedark.mp3'
const fadesIn = 2.4
const fadesOut = 1.1

let held: AudioBuffer | null = null
let playing: AudioBufferSourceNode | null = null
let swell: GainNode | null = null
let fetching = false

async function carryItIn(box: AudioContext): Promise<AudioBuffer | null> {
  if (held) {
    return held
  }

  if (fetching) {
    return null
  }

  fetching = true

  try {
    const answer = await fetch(where)
    if (!answer.ok) {
      return null
    }
    held = await box.decodeAudioData(await answer.arrayBuffer())
    return held
  } catch {
    return null
  } finally {
    fetching = false
  }
}

export function letTheDarkIn(): void {
  const box = theBox()
  const tap = tapFor('dark')

  if (!box || !tap || playing) {
    return
  }

  void carryItIn(box).then((sound) => {
    if (!sound || playing) {
      return
    }

    const inside = theBox()
    const out = tapFor('dark')

    if (!inside || !out) {
      return
    }

    swell = inside.createGain()
    swell.gain.setValueAtTime(0, inside.currentTime)
    swell.gain.linearRampToValueAtTime(1, inside.currentTime + fadesIn)
    swell.connect(out)

    playing = inside.createBufferSource()
    playing.buffer = sound
    playing.loop = true
    playing.connect(swell)
    playing.start(inside.currentTime)
  })
}

export function letTheDarkOut(): void {
  const box = theBox()

  if (!box || !playing || !swell) {
    return
  }

  const going = playing
  const fading = swell

  playing = null
  swell = null

  fading.gain.cancelScheduledValues(box.currentTime)
  fading.gain.setValueAtTime(fading.gain.value, box.currentTime)
  fading.gain.linearRampToValueAtTime(0, box.currentTime + fadesOut)

  going.stop(box.currentTime + fadesOut + 0.1)
}

export function theDarkIsPlaying(): boolean {
  return playing !== null
}
