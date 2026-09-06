import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const solc = require('solc')

const scriptFolder = dirname(fileURLToPath(import.meta.url))
const projectFolder = resolve(scriptFolder, '..')
const solFolder = join(projectFolder, 'contracts', 'sol')
const outFolder = join(projectFolder, 'contracts', 'out')
const modulesFolder = join(projectFolder, 'node_modules')

const ours = ['PatronVault.sol', 'LedgerTypes.sol', 'TheLedger.sol']

function whereDoesThisLive(asked, askedBy) {
  if (asked.startsWith('@')) {
    return join(modulesFolder, asked)
  }
  if (asked.startsWith('.')) {
    return resolve(dirname(askedBy), asked)
  }
  return join(solFolder, asked)
}

const alreadyRead = new Map()

async function readSource(path) {
  const held = alreadyRead.get(path)
  if (held) {
    return held
  }
  const text = await readFile(path, 'utf8')
  alreadyRead.set(path, text)
  return text
}

const sources = {}

for (const name of ours) {
  sources[name] = { content: await readSource(join(solFolder, name)) }
}

function findImports(asked) {
  try {
    const askedBy = Object.keys(sources).find((name) => name === asked)
    const path = asked.startsWith('@')
      ? join(modulesFolder, asked)
      : askedBy
        ? join(solFolder, asked)
        : join(solFolder, asked)

    return { contents: alreadyRead.get(path) ?? null }
  } catch (trouble) {
    return { error: String(trouble) }
  }
}

async function gatherImports(path, seen = new Set()) {
  if (seen.has(path)) {
    return
  }
  seen.add(path)

  const text = await readSource(path)
  const asks = [...text.matchAll(/import\s+[^"']*["']([^"']+)["']/g)].map((one) => one[1])

  for (const asked of asks) {
    const next = whereDoesThisLive(asked, path)
    sources[asked] = { content: await readSource(next) }
    await gatherImports(next, seen)
  }
}

for (const name of ours) {
  await gatherImports(join(solFolder, name))
}

const asked = {
  language: 'Solidity',
  sources,
  settings: {
    optimizer: { enabled: true, runs: 200 },
    viaIR: true,
    evmVersion: 'shanghai',
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object'] } }
  }
}

const answer = JSON.parse(solc.compile(JSON.stringify(asked), { import: findImports }))

const complaints = (answer.errors ?? []).filter((one) => one.severity === 'error')
const warnings = (answer.errors ?? []).filter((one) => one.severity === 'warning')

warnings.forEach((one) => console.warn(`warning: ${one.formattedMessage.trim()}`))

if (complaints.length > 0) {
  complaints.forEach((one) => console.error(one.formattedMessage))
  console.error(`\n${complaints.length} error${complaints.length === 1 ? '' : 's'}. Nothing written.`)
  process.exit(1)
}

await mkdir(outFolder, { recursive: true })

let written = 0

for (const [file, inside] of Object.entries(answer.contracts ?? {})) {
  if (!ours.includes(file)) {
    continue
  }
  for (const [name, built] of Object.entries(inside)) {
    await writeFile(
      join(outFolder, `${name}.json`),
      `${JSON.stringify(
        {
          contractName: name,
          abi: built.abi,
          bytecode: `0x${built.evm.bytecode.object}`,
          deployedSize: built.evm.deployedBytecode.object.length / 2
        },
        null,
        2
      )}\n`
    )
    console.log(
      `built ${name.padEnd(14)} ${(built.evm.deployedBytecode.object.length / 2)
        .toString()
        .padStart(6)} bytes deployed`
    )
    written += 1
  }
}

console.log(`\n${written} contracts written to contracts/out`)
