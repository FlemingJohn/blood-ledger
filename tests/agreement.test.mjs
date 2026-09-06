import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const solPath = resolve(here, '..', 'contracts', 'sol', 'TheLedger.sol')
const tsPath = resolve(here, '..', 'src', 'chain', 'settling.ts')

let checks = 0
let failures = 0

function is(what, got, want) {
  checks += 1
  if (got !== want) {
    failures += 1
    console.log(`  FAIL ${what}: contract says ${want}, the game says ${got}`)
    return
  }
  console.log(`  ok   ${what.padEnd(30)} both say ${got}`)
}

const sol = await readFile(solPath, 'utf8')
const ts = await readFile(tsPath, 'utf8')

function fromSol(name) {
  const found = sol.match(new RegExp(name + String.raw`\s*=\s*(\d+)`))
  return found ? Number(found[1]) : null
}

function fromTs(name) {
  const found = ts.match(new RegExp(name + String.raw`\s*=\s*(-?\d+)`))
  return found ? Math.abs(Number(found[1])) : null
}

console.log('the contract and the game must agree on every number\n')

is('earned by clearing', fromTs('standingForClearing'), fromSol('EARNED_BY_CLEARING'))
is('lost by leaving short', fromTs('standingForLeavingShort'), fromSol('LOST_BY_LEAVING_SHORT'))
is('lost by default', fromTs('standingForDefault'), fromSol('LOST_BY_DEFAULT'))

console.log('')
console.log(`${checks - failures} of ${checks} checks passed`)

if (failures > 0) {
  console.log('\nThe game would show a player one number and the chain would record another.')
  process.exit(1)
}
