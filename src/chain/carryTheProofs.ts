const houseLivesAt = import.meta.env.VITE_HOUSE_URL ?? 'http://localhost:8787'

export interface Carried {
  sealed: { pactId: number; raider: string; txHash: string }[]
  waiting: { pactId: number; raider?: string; blocksToGo?: number }[]
}

const secondsABlockTakes = 12

export function howLongUntilTheyAgree(blocksToGo: number): string {
  const seconds = blocksToGo * secondsABlockTakes

  if (seconds <= 45) {
    return 'any moment now'
  }

  const minutes = Math.round(seconds / 60)
  return `about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}

export async function carryWhatIsReady(): Promise<Carried | null> {
  try {
    const answer = await fetch(`${houseLivesAt}/seal`, { method: 'POST' })

    if (!answer.ok) {
      return null
    }

    return (await answer.json()) as Carried
  } catch {
    return null
  }
}

export function keepCarrying(
  everyMs: number,
  whenSealed: (carried: Carried) => void,
  whenWaiting?: (carried: Carried) => void
): () => void {
  let stopped = false

  function poke(): void {
    if (stopped) {
      return
    }

    void carryWhatIsReady().then((carried) => {
      if (stopped || !carried) {
        return
      }

      if (carried.sealed.length > 0) {
        whenSealed(carried)
      }

      if (whenWaiting && carried.waiting.length > 0) {
        whenWaiting(carried)
      }
    })
  }

  poke()
  const beat = window.setInterval(poke, everyMs)

  return (): void => {
    stopped = true
    window.clearInterval(beat)
  }
}
