import { access, copyFile, mkdir, readdir } from 'node:fs/promises'
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
  ['user interface/cursor/cursor_gauntlet_white.png', 'ui/pointer-white.png'],
  ['user interface/cursor/cursor_gauntlet_yellow.png', 'ui/pointer-yellow.png'],
  ['user interface/cursor/cursor_gauntlet_green.png', 'ui/pointer-green.png'],
  ['user interface/cursor/cursor_gauntlet_blue.png', 'ui/pointer-blue.png'],
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

const facings = [
  ['N', '90.0'],
  ['NE', '45.0'],
  ['E', '0.0'],
  ['SE', '315.0'],
  ['S', '270.0'],
  ['SW', '225.0'],
  ['W', '180.0'],
  ['NW', '135.0']
]

const fighters = [
  ['playable character/warrior', 'warrior', 'you', ['armed_walk', 'armed_attack', 'special_death']],
  ['enemy/skeleton', 'skeleton', 'skeleton', ['default_walk', 'default_attack', 'special_death']],
  ['enemy/slime', 'slime', 'slime', ['default_walk', 'special_death']],
  ['boss/demonlord', 'demonlord', 'demonlord', ['default_walk', 'default_attack1', 'special_death']]
]

const shorterName = {
  armed_walk: 'walk',
  armed_attack: 'attack',
  default_walk: 'walk',
  default_attack: 'attack',
  default_attack1: 'attack',
  special_death: 'death'
}

const framesInMove = {}

for (const [inPack, actor, calledHere, moves] of fighters) {
  for (const move of moves) {
    const oneDirection = join(packFolder, inPack, `${actor}_${move}`, 'S')
    let howMany = 8

    try {
      howMany = (await readdir(oneDirection)).filter((name) => name.endsWith('.png')).length
    } catch {
      howMany = 0
    }

    framesInMove[`${calledHere}/${shorterName[move]}`] = howMany

    for (const [facing, yaw] of facings) {
      for (let step = 0; step < howMany; step += 1) {
        wanted.push([
          `${inPack}/${actor}_${move}/${facing}/${actor}_${move}_${facing}_${yaw}_${step}.png`,
          `dungeon/${calledHere}/${shorterName[move]}-${facing}-${step}.png`
        ])
      }
    }
  }
}

const standingProps = [
  ['prop/wall1', 'wall1'],
  ['prop/wall2', 'wall2'],
  ['prop/column1', 'column'],
  ['prop/barrel', 'barrel'],
  ['prop/crate', 'crate'],
  ['prop/bones1', 'bones'],
  ['prop/rocks', 'rubble'],
  ['prop/mushrooms', 'mushrooms']
]

for (const [inPack, calledHere] of standingProps) {
  const shortName = inPack.split('/')[1]
  wanted.push([
    `${inPack}/S/${shortName}_S_270.0_0.png`,
    `dungeon/prop/${calledHere}.png`
  ])
}

for (let step = 0; step < 8; step += 1) {
  wanted.push([
    `prop/gemstones_red/S/gemstones_red_S_270.0_${step}.png`,
    `dungeon/loot/gem-${step}.png`
  ])
  wanted.push([
    `prop/gold_drop/S/gold_drop_S_270.0_${step}.png`,
    `dungeon/loot/coins-${step}.png`
  ])
}

wanted.push(['environment/ground_variation1.png', 'dungeon/ground/floor.png'])
wanted.push(['environment/ground_darken.png', 'dungeon/ground/dark.png'])

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
