const houseLivesAt = import.meta.env.VITE_HOUSE_URL ?? 'http://localhost:8787'

export interface Carried {
  sealed: { pactId: number; raider: string; txHash: string }[]
  waiting: { pactId: number; blocksToGo?: number }[]
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
  whenSealed: (carried: Carried) => void
): () => void {
  let stopped = false

  function poke(): void {
    if (stopped) {
      return
    }

    void carryWhatIsReady().then((carried) => {
      if (!stopped && carried && carried.sealed.length > 0) {
        whenSealed(carried)
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
