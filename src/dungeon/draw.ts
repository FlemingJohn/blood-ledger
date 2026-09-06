import type { Fighter } from '../types/fighter'
import type { Loot, Spot, StandingProp } from '../types/dungeon'
import type { SpriteStore } from './sprites'
import type { World } from './world'
import { drawFromGroup } from './sprites'
import { isDown } from './fighters'
import { barWidthFor, drawLifeBar } from './bars'

export const worldMagnify = 2

const feetBelowAnchor = 30
const flashLastsFor = 130
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
    const drawn = store.group(`dungeon/prop/${prop.kind}`)
    if (!drawn) {
      return
    }
    queue.push({
      sortAt: prop.spot.y,
      paint: () =>
        drawFromGroup(
          surface,
          drawn,
          0,
          toScreenX(prop.spot.x),
          toScreenY(prop.spot.y),
          worldMagnify
        )
    })
  })

  world.loot.forEach((drop: Loot) => {
    if (drop.taken) {
      return
    }
    const drawn = store.group(`dungeon/loot/${drop.kind}`)
    if (!drawn) {
      return
    }
    const spin = Math.floor(now / 110) % drawn.pictures.length
    queue.push({
      sortAt: drop.spot.y,
      paint: () => {
        const atX = toScreenX(drop.spot.x)
        const atY = toScreenY(drop.spot.y)
        const glow = drop.kind === 'gem' ? '74,127,193' : '201,162,39'

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

        if (!down && fighter.kind !== 'you' && fighter.life < fighter.fullLife) {
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
