import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const at = (name) => resolve(here, '..', 'underwriter', name)

let checks = 0
let failures = 0

function is(what, got, want) {
  checks += 1
  if (got !== want) {
    failures += 1
    console.log(`  FAIL ${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`)
    return
  }
  console.log(`  ok   ${what}`)
}

function hasNot(what, text, needle) {
  checks += 1
  if (text.includes(needle)) {
    failures += 1
    console.log(`  FAIL ${what}`)
    return
  }
  console.log(`  ok   ${what}`)
}

const explain = await readFile(at('explain.ts'), 'utf8')
const schema = await readFile(at('schema.ts'), 'utf8')
const masking = await readFile(at('masking.ts'), 'utf8')

console.log('\nthe model cannot decide anything\n')

for (const field of ['verdict', 'patronShare', 'coinsOffered', 'riskOfDefault']) {
  const inProperties = schema
    .split('properties:')[1]
    ?.split('} as const')[0]
    ?.includes(`${field}:`)
  is(`the schema has no ${field} field`, inProperties ?? false, false)
}

is(
  'the schema allows only two fields',
  (schema.match(/required: \['saidToTheRaider', 'saidToTheBoard'\]/) ?? []).length,
  1
)
is('and refuses any other', schema.includes('additionalProperties: false'), true)

console.log('\nnothing secret leaves\n')

const sent = explain.split('function whatTheModelIsTold')[1]?.split('\n}')[0] ?? ''

hasNot('no address is sent', sent, 'address')
hasNot('no transaction hash is sent', sent, 'txHash')
hasNot('no balance is sent', sent, 'balance')
hasNot('no key is sent', sent, 'PRIVATE_KEY')
is('a masked handle is sent instead', sent.includes('facts.handle'), true)

is('there is a last scrub on the way out', explain.includes('scrubbed('), true)
is('addresses are scrubbed', masking.includes('[address]'), true)
is('hashes are scrubbed', masking.includes('[hash]'), true)

console.log('\nthe model can always be switched off\n')

is('no key means our own words', explain.includes('if (!settings) {'), true)
is('a bad answer means our own words', explain.includes('return ourOwnWords(facts, decision)'), true)
is('it gives up rather than hanging', explain.includes('AbortController'), true)

console.log('\nwhat we will not print\n')

is('an unfinished sentence is refused', explain.includes("/[.!?]$/"), true)
is('a link is refused', explain.includes('https?'), true)
is('an address in the reply is refused', explain.includes('0x[0-9a-fA-F]{8}'), true)

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)

if (failures > 0) {
  process.exit(1)
}
