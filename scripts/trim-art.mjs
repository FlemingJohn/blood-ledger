import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'

const scriptFolder = dirname(fileURLToPath(import.meta.url))
const projectFolder = resolve(scriptFolder, '..')
const artFolder = join(projectFolder, 'public', 'art')
const trimmedFolder = join(artFolder, 'trimmed')

const faintestKeptFromSolids = 24
const faintestKeptFromGlows = 0

const keepWhole = ['ground/', 'ui/vignette']
const softEdged = ['ui/ring', 'ui/marker', 'flame/', 'sparkle/', 'sweep/', 'vfx/',
  'dungeon/light/glow', 'dungeon/light/flames']

function faintestKeptFor(name) {
  return softEdged.some((start) => name.startsWith(start))
    ? faintestKeptFromGlows
    : faintestKeptFromSolids
}

async function everyPngUnder(folder, found = []) {
  const entries = await readdir(folder, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(folder, entry.name)
    if (entry.isDirectory()) {
      if (path === trimmedFolder) {
        continue
      }
      await everyPngUnder(path, found)
      continue
    }
    if (entry.name.endsWith('.png')) {
      found.push(path)
    }
  }

  return found
}

function webPath(path) {
  return relative(artFolder, path).split('\\').join('/')
}

function groupNameFor(path) {
  const asWeb = webPath(path).replace(/\.png$/, '')
  const numbered = asWeb.match(/^(.*)-\d+$/)
  return numbered ? numbered[1] : asWeb
}

function frameNumberOf(path) {
  const numbered = webPath(path).match(/-(\d+)\.png$/)
  return numbered ? Number.parseInt(numbered[1], 10) : 0
}

function readPng(bytes) {
  return PNG.sync.read(bytes)
}

function edgesOf(picture, faintestKept) {
  let left = picture.width
  let top = picture.height
  let right = -1
  let bottom = -1

  for (let row = 0; row < picture.height; row += 1) {
    for (let column = 0; column < picture.width; column += 1) {
      const seeThrough = picture.data[(row * picture.width + column) * 4 + 3]
      if (seeThrough > faintestKept) {
        if (column < left) left = column
        if (column > right) right = column
        if (row < top) top = row
        if (row > bottom) bottom = row
      }
    }
  }

  return right < left || bottom < top ? null : { left, top, right, bottom }
}

function cutOut(picture, box) {
  const width = box.right - box.left + 1
  const height = box.bottom - box.top + 1
  const cut = new PNG({ width, height })

  for (let row = 0; row < height; row += 1) {
    for (let column = 0; column < width; column += 1) {
      const from = ((row + box.top) * picture.width + (column + box.left)) * 4
      const into = (row * width + column) * 4
      cut.data[into] = picture.data[from]
      cut.data[into + 1] = picture.data[from + 1]
      cut.data[into + 2] = picture.data[from + 2]
      cut.data[into + 3] = picture.data[from + 3]
    }
  }

  return cut
}

async function sizeOf(path) {
  const seen = await stat(path)
  return seen.size
}

try {
  await stat(artFolder)
} catch {
  console.error('No public/art folder. Run: npm run gather-art')
  process.exit(1)
}

const paths = (await everyPngUnder(artFolder)).sort()

if (paths.length === 0) {
  console.error('No art found under public/art. Run: npm run gather-art')
  process.exit(1)
}

const groups = new Map()

for (const path of paths) {
  const name = groupNameFor(path)
  const already = groups.get(name) ?? []
  already.push(path)
  groups.set(name, already)
}

const manifest = {}
let rawTotal = 0
let trimmedTotal = 0
let untouched = 0

for (const [name, unsorted] of [...groups].sort((first, second) => first[0].localeCompare(second[0]))) {
  const framePaths = unsorted.sort((first, second) => frameNumberOf(first) - frameNumberOf(second))
  const pictures = []

  for (const path of framePaths) {
    rawTotal += await sizeOf(path)
    pictures.push(readPng(await readFile(path)))
  }

  const first = pictures[0]
  const leaveAlone = keepWhole.some((start) => name.startsWith(start))

  let box = leaveAlone
    ? { left: 0, top: 0, right: first.width - 1, bottom: first.height - 1 }
    : null

  if (!box) {
    for (const picture of pictures) {
      const edges = edgesOf(picture, faintestKeptFor(name))
      if (!edges) {
        continue
      }
      box = box
        ? {
            left: Math.min(box.left, edges.left),
            top: Math.min(box.top, edges.top),
            right: Math.max(box.right, edges.right),
            bottom: Math.max(box.bottom, edges.bottom)
          }
        : edges
    }
  }

  if (!box) {
    box = { left: 0, top: 0, right: first.width - 1, bottom: first.height - 1 }
  }

  if (leaveAlone) {
    untouched += framePaths.length
  }

  const written = []

  for (let place = 0; place < framePaths.length; place += 1) {
    const into = join(trimmedFolder, webPath(framePaths[place]))
    await mkdir(dirname(into), { recursive: true })

    const bytes = leaveAlone
      ? await readFile(framePaths[place])
      : PNG.sync.write(cutOut(pictures[place], box), { deflateLevel: 9 })

    await writeFile(into, bytes)
    trimmedTotal += bytes.length
    written.push(`/art/trimmed/${webPath(framePaths[place])}`)
  }

  manifest[name] = {
    frames: written,
    content: {
      left: box.left,
      top: box.top,
      width: box.right - box.left + 1,
      height: box.bottom - box.top + 1
    },
    wholeFrame: { width: first.width, height: first.height }
  }
}

await writeFile(join(trimmedFolder, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

const saved = rawTotal === 0 ? 0 : 100 * (1 - trimmedTotal / rawTotal)

console.log(`Trimmed ${paths.length} pieces of art into public/art/trimmed`)
console.log(`  ${groups.size} groups, ${untouched} frames left whole on purpose`)
console.log(`  ${(rawTotal / 1024 / 1024).toFixed(2)} MB in, ${(trimmedTotal / 1024 / 1024).toFixed(2)} MB out, ${saved.toFixed(0)} percent saved`)
console.log('  offsets written to public/art/trimmed/manifest.json')
