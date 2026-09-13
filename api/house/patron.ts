import { readHouseSettings } from '../../house/settings'
import { backARaider } from '../../house/patron'
import { codeFor, letThemIn, readBody, type Asked, type Answered } from '../_door'

export default async function door(ask: Asked, answer: Answered): Promise<void> {
  if (!letThemIn(ask, answer)) {
    return
  }

  if (ask.method !== 'POST') {
    answer.status(405).json({ trouble: 'the house knows nothing of that door' })
    return
  }

  try {
    const settings = readHouseSettings()
    const body = readBody(ask)

    const told = await backARaider(settings, String(body.raider ?? ''))

    if ('txHash' in told) {
      answer.status(200).json({ backed: told })
      return
    }

    answer.status(codeFor(told.refused)).json(told)
  } catch (trouble) {
    answer.status(500).json({ trouble: (trouble as Error).message })
  }
}
