import type { WhyRefused } from '../house/purse.js'

export interface Asked {
  method?: string
  url?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}

export interface Answered {
  setHeader(name: string, value: string): void
  status(code: number): Answered
  json(body: unknown): void
  end(): void
}

const lettingIn = process.env.HOUSE_LETTING_IN ?? ''

function knocking(ask: Asked): string {
  const from = ask.headers.origin

  if (typeof from === 'string') {
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(from)) {
      return from
    }
    if (lettingIn && from === lettingIn) {
      return from
    }
    if (/\.vercel\.app$/.test(new URL(from).hostname)) {
      return from
    }
  }

  return lettingIn || '*'
}

export function letThemIn(ask: Asked, answer: Answered): boolean {
  answer.setHeader('Access-Control-Allow-Origin', knocking(ask))
  answer.setHeader('Vary', 'Origin')
  answer.setHeader('Access-Control-Allow-Headers', 'content-type')
  answer.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  answer.setHeader('Cache-Control', 'no-store')

  if (ask.method === 'OPTIONS') {
    answer.status(204).end()
    return false
  }

  return true
}

export function codeFor(refused: WhyRefused): number {
  if (refused === 'asked wrongly') {
    return 400
  }
  if (refused === 'house is dry') {
    return 503
  }
  return 429
}

export function readBody(ask: Asked): Record<string, unknown> {
  if (ask.body && typeof ask.body === 'object') {
    return ask.body as Record<string, unknown>
  }

  if (typeof ask.body === 'string') {
    try {
      return JSON.parse(ask.body || '{}') as Record<string, unknown>
    } catch {
      return {}
    }
  }

  return {}
}
