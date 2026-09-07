import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { readHouseSettings } from './settings'
import type { WhyRefused } from './purse'
import { fillAPurse, lookAtOneSide, whatTheyHold } from './purse'
import { backARaider, readTheHouseOffer } from './patron'
import { whatTheyHaveHad } from './ledgerOfGiving'

const settings = readHouseSettings()

function knocking(ask: IncomingMessage): string {
  const from = ask.headers.origin

  if (from && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(from)) {
    return from
  }

  return settings.lettingIn
}

function letThemIn(ask: IncomingMessage, answer: ServerResponse): void {
  answer.setHeader('Access-Control-Allow-Origin', knocking(ask))
  answer.setHeader('Vary', 'Origin')
  answer.setHeader('Access-Control-Allow-Headers', 'content-type')
  answer.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

function codeFor(refused: WhyRefused): number {
  if (refused === 'asked wrongly') {
    return 400
  }
  if (refused === 'house is dry') {
    return 503
  }
  return 429
}

function say(answer: ServerResponse, code: number, body: unknown): void {
  const written = JSON.stringify(body)
  answer.writeHead(code, { 'content-type': 'application/json' })
  answer.end(written)
}

function readBody(ask: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((settle) => {
    let held = ''

    ask.on('data', (piece) => {
      held += String(piece)
      if (held.length > 4096) {
        ask.destroy()
      }
    })

    ask.on('end', () => {
      try {
        settle(JSON.parse(held || '{}') as Record<string, unknown>)
      } catch {
        settle({})
      }
    })

    ask.on('error', () => settle({}))
  })
}

async function tellThemWhatTheHouseHas(who: string): Promise<unknown> {
  const [sepolia, creditcoin, offer] = await Promise.all([
    lookAtOneSide(settings.sepolia),
    lookAtOneSide(settings.creditcoin),
    readTheHouseOffer(settings)
  ])

  const had = whatTheyHaveHad(who)

  const youHold = who
    ? {
        sepolia: await whatTheyHold(settings.sepolia, who),
        creditcoin: await whatTheyHold(settings.creditcoin, who)
      }
    : null

  return {
    purse: {
      sepolia,
      creditcoin,
      pursesLeft: Math.max(0, settings.mostPerAddress - had.times),
      mostPerAddress: settings.mostPerAddress
    },
    patron: offer,
    youHold
  }
}

const house = createServer((ask, answer) => {
  letThemIn(ask, answer)

  if (ask.method === 'OPTIONS') {
    answer.writeHead(204)
    answer.end()
    return
  }

  const way = new URL(ask.url ?? '/', 'http://the.house')

  if (ask.method === 'GET' && way.pathname === '/house') {
    void tellThemWhatTheHouseHas(way.searchParams.get('address') ?? '')
      .then((told) => say(answer, 200, told))
      .catch((trouble: Error) => say(answer, 500, { trouble: trouble.message }))
    return
  }

  if (ask.method === 'POST' && way.pathname === '/house/purse') {
    void readBody(ask)
      .then((body) => fillAPurse(settings, String(body.address ?? '')))
      .then((told) => {
        if (Array.isArray(told)) {
          say(answer, 200, { given: told })
          return
        }
        say(answer, codeFor(told.refused), told)
      })
      .catch((trouble: Error) => say(answer, 500, { trouble: trouble.message }))
    return
  }

  if (ask.method === 'POST' && way.pathname === '/house/patron') {
    void readBody(ask)
      .then((body) => backARaider(settings, String(body.raider ?? '')))
      .then((told) => {
        if ('txHash' in told) {
          say(answer, 200, { backed: told })
          return
        }
        say(answer, codeFor(told.refused), told)
      })
      .catch((trouble: Error) => say(answer, 500, { trouble: trouble.message }))
    return
  }

  say(answer, 404, { trouble: 'the house knows nothing of that door' })
})

house.listen(settings.port, () => {
  console.log('Blood Ledger house')
  console.log(`  listening on http://localhost:${settings.port}`)
  console.log(`  letting in    ${settings.lettingIn}`)
  console.log(`  pours         ${settings.sepolia.drip} ETH and ${settings.creditcoin.drip} tCTC`)
  console.log(`  keeps back    ${settings.sepolia.keepsBack} ETH and ${settings.creditcoin.keepsBack} tCTC`)
  console.log(`  per address   ${settings.mostPerAddress} purses, ${settings.waitBetween / 1000}s apart`)
  console.log(`  stakes        ${settings.stake} ETH at ${settings.share} percent`)
  console.log(
    settings.patronVault
      ? `  vault         ${settings.patronVault}`
      : '  vault         not deployed yet, so the house cannot stake'
  )
})

process.on('SIGINT', () => {
  console.log('\nthe house is closing')
  house.close(() => process.exit(0))
})
