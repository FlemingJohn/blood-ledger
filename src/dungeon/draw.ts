import type { Fighter } from '../types/fighter'
import type { Loot, Spot, StandingProp } from '../types/dungeon'
import type { SpriteStore } from './sprites'
import type { World } from './world'
import { drawFromGroup } from './sprites'
import { isDown } from './fighters'
import { barWidthFor, drawLifeBar } from './bars'
import { glowOf } from './gems'

export const worldMagnify = 2

const feetBelowAnchor = 30
const flashLastsFor = 130
const breakLastsFor = 900
const barSitsAbove = 78

interface Drawable {
  sortAt: number
  paint(): void
}

export interface Eye {
  atX: number
  atY: number
}

export function followWith(eye: Eye, on: Spot, wide: number, tall: number, world: World): void {
  const wantX = on.x - wide / (2 * worldMagnify)
  const wantY = on.y - tall / (2 * worldMagnify)

  const mostX = Math.max(0, world.plan.width - wide / worldMagnify)
  const mostY = Math.max(0, world.plan.height - tall / worldMagnify)

  eye.atX = Math.max(0, Math.min(mostX, wantX))
  eye.atY = Math.max(0, Math.min(mostY, wantY))
}

function moveNameFor(fighter: Fighter): string {
  return `dungeon/${fighter.kind}/${fighter.move}-${fighter.facing}`
}

export function paintWorld(
  surface: CanvasRenderingContext2D,
  world: World,
  store: SpriteStore,
  ground: { floor: HTMLImageElement; dark: HTMLImageElement },
  eye: Eye,
  wide: number,
  tall: number,
  now: number
): void {
  surface.imageSmoothingEnabled = false
  surface.fillStyle = '#0a0307'
  surface.fillRect(0, 0, wide, tall)

  const tileSize = ground.floor.width * worldMagnify
  const firstX = -((eye.atX * worldMagnify) % tileSize)
  const firstY = -((eye.atY * worldMagnify) % tileSize)

  for (let y = firstY; y < tall; y += tileSize) {
    for (let x = firstX; x < wide; x += tileSize) {
      surface.drawImage(ground.floor, Math.round(x), Math.round(y), tileSize, tileSize)
    }
  }

  function toScreenX(worldX: number): number {
    return (worldX - eye.atX) * worldMagnify
  }

  function toScreenY(worldY: number): number {
    return (worldY - eye.atY) * worldMagnify - feetBelowAnchor
  }

  const queue: Drawable[] = []

  world.plan.props.forEach((prop: StandingProp) => {
    const broken = prop.broken
    const since = now - prop.brokeAt

    if (broken && since > breakLastsFor) {
      return
    }

    const drawn = broken
      ? store.group(`dungeon/broken/${prop.kind}`)
      : store.group(`dungeon/prop/${prop.kind}`)

    if (!drawn) {
      return
    }

    const frame = broken
      ? Math.min(drawn.pictures.length - 1, Math.floor(since / 70))
      : 0

    queue.push({
      sortAt: prop.spot.y,
      paint: () => {
        const atX = toScreenX(prop.spot.x)
        const atY = toScreenY(prop.spot.y)

        if (broken) {
          surface.globalAlpha = Math.max(0, 1 - since / breakLastsFor)
        }

        drawFromGroup(surface, drawn, frame, atX, atY, worldMagnify)
        surface.globalAlpha = 1
      }
    })
  })

  world.plan.lights.forEach((light) => {
    const brazier = store.group('dungeon/light/brazier')
    const flames = store.group('dungeon/light/flames')

    queue.push({
      sortAt: light.spot.y,
      paint: () => {
        const atX = toScreenX(light.spot.x)
        const atY = toScreenY(light.spot.y)
        const flicker = 0.78 + Math.sin(now / 90) * 0.12 + Math.sin(now / 41) * 0.06

        const pool = surface.createRadialGradient(atX, atY, 4, atX, atY, 150 * flicker)
        pool.addColorStop(0, 'rgba(255,150,80,.32)')
        pool.addColorStop(0.45, 'rgba(214,21,78,.14)')
        pool.addColorStop(1, 'rgba(139,11,46,0)')
        surface.fillStyle = pool
        surface.fillRect(atX - 160, atY - 160, 320, 320)

        if (brazier) {
          drawFromGroup(surface, brazier, light.frame, atX, atY, worldMagnify)
        }
        if (flames) {
          surface.save()
          surface.globalAlpha = 0.85
          surface.globalCompositeOperation = 'lighter'
          drawFromGroup(surface, flames, light.frame, atX, atY - 26, worldMagnify * 0.5)
          surface.restore()
        }
      }
    })
  })

  world.loot.forEach((drop: Loot) => {
    if (drop.taken) {
      return
    }
    const drawn = store.group(
      drop.kind === 'gem' ? `dungeon/loot/gem-${drop.grade ?? 'white'}` : 'dungeon/loot/coins'
    )
    if (!drawn) {
      return
    }
    const spin = Math.floor(now / 110) % drawn.pictures.length
    queue.push({
      sortAt: drop.spot.y,
      paint: () => {
        const atX = toScreenX(drop.spot.x)
        const atY = toScreenY(drop.spot.y)
        const glow = drop.kind === 'gem' ? glowOf(drop.grade) : '201,162,39'

        const beam = surface.createLinearGradient(atX, atY - 96, atX, atY)
        beam.addColorStop(0, `rgba(${glow},0)`)
        beam.addColorStop(1, `rgba(${glow},.34)`)
        surface.fillStyle = beam
        surface.fillRect(atX - 9, atY - 96, 18, 96)

        const pool = surface.createRadialGradient(atX, atY, 1, atX, atY, 30)
        pool.addColorStop(0, `rgba(${glow},.42)`)
        pool.addColorStop(1, `rgba(${glow},0)`)
        surface.fillStyle = pool
        surface.fillRect(atX - 32, atY - 18, 64, 36)

        drawFromGroup(surface, drawn, spin, atX, atY, worldMagnify)
      }
    })
  })

  const everyone = [world.you, ...world.enemies]

  everyone.forEach((fighter) => {
    if (fighter.gone) {
      return
    }
    const drawn = store.group(moveNameFor(fighter))
    if (!drawn) {
      return
    }
    queue.push({
      sortAt: fighter.spot.y,
      paint: () => {
        const atX = toScreenX(fighter.spot.x)
        const atY = toScreenY(fighter.spot.y)
        const down = isDown(fighter)
        const flashing = !down && now - fighter.struckAt < flashLastsFor
        const breed = fighter.breed
        const swell = breed ? breed.swell : 1

        surface.save()

        if (down) {
          surface.globalAlpha = 0.85
        }
        if (breed && breed.tint) {
          surface.filter = breed.tint
        }
        if (swell !== 1) {
          surface.translate(atX, atY)
          surface.scale(swell, swell)
          surface.translate(-atX, -atY)
        }

        drawFromGroup(surface, drawn, fighter.frame, atX, atY, worldMagnify)

        if (flashing) {
          surface.filter = 'none'
          surface.globalCompositeOperation = 'lighter'
          surface.globalAlpha = 0.55 * (1 - (now - fighter.struckAt) / flashLastsFor)
          drawFromGroup(surface, drawn, fighter.frame, atX, atY, worldMagnify)
        }

        surface.restore()

        if (!down && fighter !== world.you && fighter.life < fighter.fullLife) {
          const barWide = barWidthFor(fighter) * swell
          drawLifeBar(
            surface,
            atX - barWide / 2,
            atY - barSitsAbove * swell,
            barWide,
            4,
            fighter.life / fighter.fullLife
          )
        }
      }
    })
  })

  queue.sort((first, second) => first.sortAt - second.sortAt)
  queue.forEach((item) => item.paint())

  surface.font = '600 15px "JetBrains Mono", monospace'
  surface.textAlign = 'center'

  world.wounds.forEach((wound) => {
    const age = (now - wound.bornAt) / 900
    surface.globalAlpha = Math.max(0, 1 - age)
    surface.fillStyle = '#ff3d78'
    surface.fillText(
      String(wound.amount),
      toScreenX(wound.spot.x),
      toScreenY(wound.spot.y) - 40 - age * 34
    )
  })

  surface.globalAlpha = 1

  const edge = surface.createRadialGradient(
    wide / 2,
    tall / 2,
    Math.min(wide, tall) * 0.32,
    wide / 2,
    tall / 2,
    Math.max(wide, tall) * 0.72
  )
  edge.addColorStop(0, 'rgba(4,0,2,0)')
  edge.addColorStop(1, 'rgba(4,0,2,0.9)')
  surface.fillStyle = edge
  surface.fillRect(0, 0, wide, tall)
}
