import type { Part } from '../types/parts'
import type { RaidOrder, Takings } from '../types/raid'
import type { Eye } from '../dungeon/draw'
import type { World } from '../dungeon/world'
import { openSpriteStore, loadGroundTiles } from '../dungeon/sprites'
import { followWith, paintWorld } from '../dungeon/draw'
import { everyoneStanding, openWorld, turnTheWorld, whatWasLeftBehind } from '../dungeon/world'
import { takeTheHands } from '../dungeon/hands'
import { hangThePressureBar } from '../parts/pressureBar'
import { hangTheLifeGlobe } from '../parts/lifeGlobe'
import { openTheWayOut } from '../parts/wayOut'
import { prepareTheReckoning } from '../parts/reckoning'
import { pinTheMinimap } from '../parts/minimap'
import { buckleThePowerBelt } from '../parts/powerBelt'
import { powersFor } from '../dungeon/powers'
import { reckonTheRaid } from '../chain/settling'
import '../styles/descent.css'

const facings = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']

function everyMoveOf(kind: string, moves: string[]): string[] {
  const names: string[] = []
  moves.forEach((move) => {
    facings.forEach((facing) => names.push(`dungeon/${kind}/${move}-${facing}`))
  })
  return names
}

function everyMoveOfYours(chosen: string): string[] {
  return everyMoveOf(chosen, ['walk', 'attack', 'death'])
}

const soonestNeeded = [

  ...everyMoveOf('skeleton', ['walk', 'attack', 'death']),
  ...everyMoveOf('slime', ['walk', 'death']),
  'dungeon/prop/wall1',
  'dungeon/prop/wall2',
  'dungeon/prop/column',
  'dungeon/prop/barrel',
  'dungeon/prop/crate',
  'dungeon/prop/bones',
  'dungeon/prop/rubble',
  'dungeon/prop/mushrooms',
  'dungeon/prop/wall3',
  'dungeon/prop/bricks',
  'dungeon/prop/tiles',
  'dungeon/prop/column2',
  'dungeon/prop/bones2',
  'dungeon/prop/bones3',
  'dungeon/prop/brazier',
  'dungeon/broken/barrel',
  'dungeon/broken/crate',
  'dungeon/light/brazier',
  'dungeon/light/flames',
  'dungeon/light/glow',
  'dungeon/loot/coins',
  'dungeon/loot/gem-white',
  'dungeon/loot/gem-green',
  'dungeon/loot/gem-blue',
  'dungeon/loot/gem-red'
]

const bossNeeded = everyMoveOf('demonlord', ['walk', 'attack', 'death'])

export interface DescentOrder extends RaidOrder {
  whenSettled(takings: Takings): void
}

export function buildDescent(order: DescentOrder): Part {
  const page = document.createElement('main')
  page.className = 'descent'

  const board = document.createElement('canvas')
  board.className = 'descent__board'

  const pressure = hangThePressureBar(order.seed)
  const life = hangTheLifeGlobe()
  const wayOut = openTheWayOut()
  const reckoning = prepareTheReckoning()
  const minimap = pinTheMinimap()
  const belt = buckleThePowerBelt(powersFor(order.chosenClass))

  const hint = document.createElement('p')
  hint.className = 'descent__hint'
  hint.textContent = 'W A S D to move · click or space to swing · Q and E for powers'

  page.append(
    board,
    pressure.element,
    minimap.element,
    life.element,
    belt.element,
    hint,
    wayOut.element,
    reckoning.element
  )

  const hands = takeTheHands(board)
  const eye: Eye = { atX: 0, atY: 0 }

  let world: World = openWorld({
    seed: order.seed.seed,
    floor: 1,
    chosenClass: order.chosenClass
  })
  let running = true
  let settled = false
  let lastAt = 0
  let heartbeat = 0

  const surface = board.getContext('2d')

  function fitBoard(): void {
    const steps = Math.max(1, Math.round(window.devicePixelRatio || 1))
    board.width = Math.round(page.clientWidth * steps)
    board.height = Math.round(page.clientHeight * steps)
    board.style.width = `${page.clientWidth}px`
    board.style.height = `${page.clientHeight}px`
    if (surface) {
      surface.setTransform(steps, 0, 0, steps, 0, 0)
    }
  }

  function settle(ending: 'walked out' | 'fell'): void {
    if (settled) {
      return
    }
    settled = true
    running = false

    const takings = reckonTheRaid({
      pact: order.pact,
      ending,
      floorReached: world.floor,
      coinsCarried: world.coinsCarried,
      standingBefore: order.standing,
      killedBy: world.killedBy
    })

    reckoning.showTakings(takings, order.pact.patronAddress, whatWasLeftBehind(world))
    reckoning.whenReturning(() => order.whenSettled(takings))
  }

  function goDeeper(): void {
    const carried = world.coinsCarried
    const slain = world.slain
    const smashed = world.smashed
    const powersUsed = world.powersUsed
    const breedsMet = world.breedsMet
    const deepest = world.floor + 1

    world = openWorld({
      seed: order.seed.seed,
      floor: deepest,
      chosenClass: order.chosenClass
    })

    world.coinsCarried = carried
    world.slain = slain
    world.smashed = smashed
    world.powersUsed = powersUsed
    world.breedsMet = breedsMet
    world.deepestFloor = deepest

    pressure.showFloor(world.floor)

    if (world.plan.bossSpot) {
      void store?.bring(bossNeeded)
    }
  }

  let store: Awaited<ReturnType<typeof openSpriteStore>> | null = null
  let ground: Awaited<ReturnType<typeof loadGroundTiles>> | null = null

  function beat(now: number): void {
    if (!running && settled) {
      return
    }
    if (!surface || !store || !ground) {
      heartbeat = window.requestAnimationFrame(beat)
      return
    }

    if (lastAt === 0) {
      lastAt = now
    }
    const seconds = Math.min(0.05, (now - lastAt) / 1000)
    lastAt = now

    if (running) {
      turnTheWorld(world, hands.read(), seconds, now)
    }

    followWith(eye, world.you.spot, page.clientWidth, page.clientHeight, world)
    paintWorld(surface, world, store, ground, eye, page.clientWidth, page.clientHeight, now)

    minimap.redraw(world, now)
    life.showLife(Math.max(0, world.you.life), world.you.fullLife)
    pressure.showSlain(world.slain)
    belt.showRest(world, now)
    pressure.showCoins(world.coinsCarried, order.pact.coinsStaked)
    wayOut.showSum(world.coinsCarried, order.pact.patronShare, order.pact.coinsStaked)
    wayOut.showDeeperReady(everyoneStanding(world))

    if (world.finished === 'fell' && world.you.gone) {
      settle('fell')
    }

    heartbeat = window.requestAnimationFrame(beat)
  }

  wayOut.whenLeaving(() => settle('walked out'))
  wayOut.whenGoingDeeper(goDeeper)

  window.addEventListener('resize', fitBoard)

  void (async () => {
    store = await openSpriteStore()
    ground = await loadGroundTiles()
    await store.bring([...everyMoveOfYours(order.chosenClass), ...soonestNeeded])
    fitBoard()
    pressure.showFloor(world.floor)
    void store.bring(bossNeeded)
  })()

  heartbeat = window.requestAnimationFrame(beat)

  return {
    element: page,
    teardown(): void {
      running = false
      settled = true
      window.cancelAnimationFrame(heartbeat)
      window.removeEventListener('resize', fitBoard)
      hands.letGo()
      belt.teardown()
      minimap.teardown()
      reckoning.teardown()
      wayOut.teardown()
      life.teardown()
      pressure.teardown()
      page.remove()
    }
  }
}
