import type { Part } from '../types/parts'
import type { RaidOrder, Takings } from '../types/raid'
import { chainHauls, stoneGrinds, youWalkedOut, youWereLost } from '../sound/blows'
import { hangTheSoundHorn } from '../parts/soundHorn'
import type { Eye } from '../dungeon/draw'
import type { World } from '../dungeon/world'
import { openSpriteStore, loadGroundTiles } from '../dungeon/sprites'
import { followWith, paintWorld } from '../dungeon/draw'
import { openWorld, theWayDownIsOpen, turnTheWorld, whatWasLeftBehind } from '../dungeon/world'
import { takeTheHands } from '../dungeon/hands'
import { hangThePressureBar } from '../parts/pressureBar'
import { coverTheStair } from '../parts/descending'
import { hangTheLifeGlobe } from '../parts/lifeGlobe'
import { openTheWayOut } from '../parts/wayOut'
import { prepareTheReckoning } from '../parts/reckoning'
import { pinTheMinimap } from '../parts/minimap'
import { buckleThePowerBelt } from '../parts/powerBelt'
import { powersFor } from '../dungeon/powers'
import { reckonTheRaid } from '../chain/settling'
import {
  lookUpOnCreditcoin,
  plainly,
  theLedgerTakesWrites,
  writeTheRaidToTheChain
} from '../chain/tellTheLedger'
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
  whenWayOutOpens(open: boolean): void
}

export function buildDescent(order: DescentOrder): Part {
  const page = document.createElement('main')
  page.className = 'descent'

  const board = document.createElement('canvas')
  board.className = 'descent__board'

  const pressure = hangThePressureBar(order.seed)
  const life = hangTheLifeGlobe()
  const wayOut = openTheWayOut()
  const horn = hangTheSoundHorn()
  horn.element.classList.add('soundhorn--afloat')
  let wayIsOpen = false
  const reckoning = prepareTheReckoning()
  const minimap = pinTheMinimap()
  const belt = buckleThePowerBelt(powersFor(order.chosenClass))

  const hint = document.createElement('p')
  hint.className = 'descent__hint'
  hint.textContent = 'W A S D to move · click or space to swing · Q and E for powers'

  const stair = coverTheStair()
  stair.showFloor(1)

  page.append(
    board,
    pressure.element,
    minimap.element,
    life.element,
    belt.element,
    hint,
    wayOut.element,
    horn.element,
    stair.element,
    reckoning.element
  )

  const hands = takeTheHands(board)
  const eye: Eye = { atX: 0, atY: 0 }

  let world: World = openWorld({
    seed: order.seed.seed,
    floor: 1,
    owed: order.pact.coinsStaked,
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
    if (ending === 'walked out') {
      youWalkedOut()
    } else {
      youWereLost()
    }

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

    writeItDown(takings)
  }

  function writeItDown(takings: Takings): void {
    const which = order.pact.pactId

    if (which === null || !theLedgerTakesWrites) {
      return
    }

    reckoning.showWriting('Your purse is being asked to write this to Creditcoin.', null, true)

    void writeTheRaidToTheChain(which, takings.ending, takings.coinsCarried)
      .then((written) => {
        reckoning.showWriting(
          takings.ending === 'walked out'
            ? 'Written down. Your standing moved and your bond came back.'
            : 'Written down. Your standing fell and your bond went to the patron.',
          lookUpOnCreditcoin(written.txHash),
          false
        )
      })
      .catch((trouble: unknown) => {
        reckoning.showWriting(
          `The chain did not take it — ${plainly(trouble)}. Your standing has not moved.`,
          null,
          false
        )
      })
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
      chosenClass: order.chosenClass,
      owed: order.pact.coinsStaked
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
    world.seenWide = page.clientWidth
    world.seenTall = page.clientHeight

    const clear = theWayDownIsOpen(world)
    wayOut.showDeeperReady(clear)

    if (clear !== wayIsOpen) {
      wayIsOpen = clear
      order.whenWayOutOpens(clear)
    }

    if (world.finished === 'fell' && world.you.gone) {
      settle('fell')
    }

    heartbeat = window.requestAnimationFrame(beat)
  }

  wayOut.whenLeaving(() => {
    chainHauls()
    settle('walked out')
  })
  wayOut.whenGoingDeeper(() => {
    stoneGrinds(world.floor + 1)
    goDeeper()
  })

  window.addEventListener('resize', fitBoard)

  void (async () => {
    store = await openSpriteStore()
    stair.reached(1)

    ground = await loadGroundTiles()
    stair.reached(2)

    await store.bring([...everyMoveOfYours(order.chosenClass), ...soonestNeeded])
    stair.reached(3)

    fitBoard()
    pressure.showFloor(world.floor)
    stair.done()
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
      stair.teardown()
      belt.teardown()
      minimap.teardown()
      reckoning.teardown()
      horn.teardown()
      wayOut.teardown()
      life.teardown()
      pressure.teardown()
      page.remove()
    }
  }
}
