import { readHouseSettings } from '../house/settings.js'
import { alreadyHasEnough, lookAtOneSide, whatTheyHold } from '../house/purse.js'
import { readTheHouseOffer } from '../house/patron.js'
import { letThemIn, type Asked, type Answered } from './_door.js'

export default async function door(ask: Asked, answer: Answered): Promise<void> {
  if (!letThemIn(ask, answer)) {
    return
  }

  if (ask.method !== 'GET') {
    answer.status(405).json({ trouble: 'the house knows nothing of that door' })
    return
  }

  try {
    const settings = readHouseSettings()

    const asked = ask.query?.address
    const who = typeof asked === 'string' ? asked : ''

    const [sepolia, creditcoin, offer] = await Promise.all([
      lookAtOneSide(settings.sepolia),
      lookAtOneSide(settings.creditcoin),
      readTheHouseOffer(settings)
    ])

    const youHold = who
      ? {
          sepolia: await whatTheyHold(settings.sepolia, who),
          creditcoin: await whatTheyHold(settings.creditcoin, who)
        }
      : null

    const full = who
      ? (await alreadyHasEnough(settings.sepolia, who)) &&
        (await alreadyHasEnough(settings.creditcoin, who))
      : false

    answer.status(200).json({
      purse: {
        sepolia,
        creditcoin,
        pursesLeft: full ? 0 : 1,
        mostPerAddress: 1
      },
      patron: offer,
      youHold
    })
  } catch (trouble) {
    answer.status(500).json({ trouble: (trouble as Error).message })
  }
}
