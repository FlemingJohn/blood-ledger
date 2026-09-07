import type { Backed, HandedOver, HouseAnswer, HouseReading } from '../types/house'

const houseLivesAt = import.meta.env.VITE_HOUSE_URL ?? 'http://localhost:8787'

const houseIsShut = 'the house is not open. Run npm run house.'

async function knock<Held>(way: string, sent?: unknown): Promise<HouseAnswer<Held>> {
  try {
    const asked: RequestInit = sent
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sent) }
      : { method: 'GET' }

    const answer = await fetch(`${houseLivesAt}${way}`, asked)

    const told = (await answer.json()) as Record<string, unknown>

    if (!answer.ok) {
      return { trouble: String(told.trouble ?? 'the house refused') }
    }

    return { held: told as Held }
  } catch {
    return { trouble: houseIsShut }
  }
}

export async function askTheHouse(address: string | null): Promise<HouseAnswer<HouseReading>> {
  const asked = address ? `?address=${address}` : ''
  return knock<HouseReading>(`/house${asked}`)
}

export async function askForAPurse(address: string): Promise<HouseAnswer<{ given: HandedOver[] }>> {
  return knock<{ given: HandedOver[] }>('/house/purse', { address })
}

export async function askTheHouseToBackYou(raider: string): Promise<HouseAnswer<{ backed: Backed }>> {
  return knock<{ backed: Backed }>('/house/patron', { raider })
}

export function theHouseAnswered<Held>(answer: HouseAnswer<Held>): answer is { held: Held } {
  return 'held' in answer
}
