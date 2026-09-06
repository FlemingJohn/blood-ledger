import type { Decision, RaiderFacts, WrittenReason } from './types'
import { howToBehave, wordsSchema } from './schema'
import { nothingSecretIn, scrubbed } from './masking'

const giveUpAfter = 12_000
const longestSentence = 220
const longestLine = 110

interface AzureSettings {
  apiKey: string
  endpoint: string
  deployment: string
  apiVersion: string
}

function azureSettings(): AzureSettings | null {
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  const apiVersion = process.env.AZURE_API_VERSION

  if (!apiKey || !endpoint || !deployment || !apiVersion) {
    return null
  }

  return {
    apiKey,
    endpoint: endpoint.replace(/\/$/, ''),
    deployment,
    apiVersion
  }
}

/** Everything the model is allowed to see. Masked names only, never an address. */
function whatTheModelIsTold(facts: RaiderFacts, decision: Decision): object {
  return {
    raider: facts.handle,
    theyHave: {
      standing: facts.standing,
      grade: facts.grade,
      raids: facts.raids,
      repaid: facts.repaid,
      lost: facts.lost,
      deepestFloor: facts.deepestFloor,
      patronsSoFar: facts.distinctPatrons
    },
    decisionAlreadyMade: {
      verdict: decision.verdict,
      patronShare: decision.patronShare,
      coinsOffered: decision.coinsOffered,
      riskOfDefault: decision.riskOfDefault
    },
    whyItWentThatWay: decision.reasons,
    thingsNoted: decision.flags
  }
}

/** What we say when there is no model, or the model gave us something we will not use. */
export function ourOwnWords(facts: RaiderFacts, decision: Decision): WrittenReason {
  if (decision.verdict === 'refuse') {
    const first = decision.reasons[0] ?? 'nothing here to trust'
    return {
      saidToTheRaider: `No. ${capital(first)}. Come back when that is not true.`,
      saidToTheBoard: `Refused. ${capital(first)}.`,
      camefrom: 'our own words'
    }
  }

  return {
    saidToTheRaider: `${facts.handle}, I will put up ${decision.coinsOffered} and keep ${decision.patronShare} percent. You have repaid ${facts.repaid} of ${facts.raids}. Do not make me regret it.`,
    saidToTheBoard: `${decision.coinsOffered} at ${decision.patronShare} percent, standing ${facts.standing}.`,
    camefrom: 'our own words'
  }
}

function capital(said: string): string {
  return said.charAt(0).toUpperCase() + said.slice(1)
}

function willNotUse(said: unknown, longest: number): boolean {
  if (typeof said !== 'string') {
    return true
  }

  const trimmed = said.trim()

  if (trimmed.length === 0 || trimmed.length > longest) {
    return true
  }

  // A model that runs to the cap gets cut mid word. Better our own plain
  // sentence than half of a better one.
  if (!/[.!?]$/.test(trimmed)) {
    return true
  }

  if (/https?:\/\/|@|0x[0-9a-fA-F]{8}/.test(trimmed)) {
    return true
  }

  return false
}

export async function putItInWords(
  facts: RaiderFacts,
  decision: Decision
): Promise<WrittenReason> {
  const settings = azureSettings()
  if (!settings) {
    return ourOwnWords(facts, decision)
  }

  const told = whatTheModelIsTold(facts, decision)

  if (!nothingSecretIn(told)) {
    return ourOwnWords(facts, decision)
  }

  const giveUp = new AbortController()
  const timer = setTimeout(() => giveUp.abort(), giveUpAfter)

  try {
    const answer = await fetch(
      `${settings.endpoint}/openai/deployments/${settings.deployment}/chat/completions?api-version=${settings.apiVersion}`,
      {
        method: 'POST',
        signal: giveUp.signal,
        headers: {
          'Content-Type': 'application/json',
          'api-key': settings.apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: howToBehave },
            { role: 'user', content: JSON.stringify(told) }
          ],
          temperature: 0.7,
          max_tokens: 220,
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'written_reason', strict: true, schema: wordsSchema }
          }
        })
      }
    )

    if (!answer.ok) {
      return ourOwnWords(facts, decision)
    }

    const body = (await answer.json()) as {
      choices?: { message?: { content?: string } }[]
    }

    const said = body.choices?.[0]?.message?.content
    if (!said) {
      return ourOwnWords(facts, decision)
    }

    const written = JSON.parse(said) as Record<string, unknown>

    if (
      willNotUse(written.saidToTheRaider, longestSentence) ||
      willNotUse(written.saidToTheBoard, longestLine)
    ) {
      return ourOwnWords(facts, decision)
    }

    return {
      saidToTheRaider: scrubbed(String(written.saidToTheRaider)),
      saidToTheBoard: scrubbed(String(written.saidToTheBoard)),
      camefrom: 'the model'
    }
  } catch {
    return ourOwnWords(facts, decision)
  } finally {
    clearTimeout(timer)
  }
}
