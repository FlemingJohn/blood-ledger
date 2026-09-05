import { access, copyFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptFolder = dirname(fileURLToPath(import.meta.url))
const projectFolder = resolve(scriptFolder, '..')
const artFolder = join(projectFolder, 'public', 'art')

const packFolder =
  process.env.LORDS_OF_PAIN_PACK ??
  resolve(projectFolder, '..', 'Lords Of Pain - Old School Isometric Assets')

const wanted = [
  ['environment/ground_stone1.png', 'ground/stone.png'],
  ['user interface/filter/filter_vignette.png', 'ui/vignette.png'],
  ['user interface/cursor/cursor_gauntlet_red.png', 'ui/pointer-red.png'],
  ['user interface/highlight/highlight_red.png', 'ui/ring-red.png'],
  ['user interface/loot-indicator/loot_indicator_red.png', 'ui/marker-red.png'],
  ['boss/demonlord/demonlord_default_idle/S/demonlord_default_idle_S_270.0_0.png', 'watcher/idle.png'],
  ['prop/bones1/S/bones1_S_270.0_0.png', 'scatter/bones.png'],
  ['prop/rocks/S/rocks_S_270.0_0.png', 'scatter/rocks.png'],
  ['prop/gold_drop/S/gold_drop_S_270.0_0.png', 'prop/coins.png']
]

const raiderClasses = ['warrior', 'knight', 'fighter']

for (let step = 0; step < 8; step += 1) {
  wanted.push([`prop/brazier_lit/S/brazier_lit_S_270.0_${step}.png`, `torch/lit-${step}.png`])
  wanted.push([`vfx/flame/flame_${step}.png`, `flame/flame-${step}.png`])
  wanted.push([`vfx/swoosh/swoosh_${step}.png`, `sweep/sweep-${step}.png`])
  wanted.push([`vfx/glint/glint_${step}.png`, `sparkle/glint-${step}.png`])

  for (const fighterName of raiderClasses) {
    wanted.push([
      `playable character/${fighterName}/${fighterName}_special_select/S/${fighterName}_special_select_S_270.0_${step}.png`,
      `raider/${fighterName}-${step}.png`
    ])
  }
}

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

if (!(await exists(packFolder))) {
  console.error('Cannot find the art pack.')
  console.error(`Looked in: ${packFolder}`)
  console.error('Set LORDS_OF_PAIN_PACK to the folder you unzipped it into, then run this again.')
  process.exit(1)
}

let copied = 0
const missing = []

for (const [fromPack, intoProject] of wanted) {
  const source = join(packFolder, fromPack)
  const target = join(artFolder, intoProject)

  if (!(await exists(source))) {
    missing.push(fromPack)
    continue
  }

  await mkdir(dirname(target), { recursive: true })
  await copyFile(source, target)
  copied += 1
}

console.log(`Gathered ${copied} pieces of art into public/art`)

if (missing.length > 0) {
  console.warn(`Could not find ${missing.length} of them:`)
  missing.forEach((path) => console.warn(`  ${path}`))
  process.exit(1)
}
