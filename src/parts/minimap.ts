import type { Part } from '../types/parts'
import type { World } from '../dungeon/world'
import { isDown } from '../dungeon/fighters'

const mapWide = 168
const mapTall = 132
const seenWithin = 460

export interface MinimapPart extends Part {
  redraw(world: World, now: number): void
}

export function pinTheMinimap(): MinimapPart {
  const frame = document.createElement('div')
  frame.className = 'minimap'
  frame.setAttribute('aria-hidden', 'true')

  const board = document.createElement('canvas')
  const steps = Math.max(1, Math.round(window.devicePixelRatio || 1))
  board.width = mapWide * steps
  board.height = mapTall * steps
  board.style.width = `${mapWide}px`
  board.style.height = `${mapTall}px`

  const surface = board.getContext('2d')
  if (surface) {
    surface.scale(steps, steps)
    surface.imageSmoothingEnabled = false
  }

  frame.append(board)

  return {
    element: frame,

    redraw(world: World, now: number): void {
      if (!surface) {
        return
      }

      const plan = world.plan
      const fit = Math.min(mapWide / plan.across, mapTall / plan.down)
      const offX = (mapWide - plan.across * fit) / 2
      const offY = (mapTall - plan.down * fit) / 2
      const cell = Math.max(1, Math.ceil(fit))

      surface.clearRect(0, 0, mapWide, mapTall)
      surface.fillStyle = 'rgba(4,0,2,.82)'
      surface.fillRect(0, 0, mapWide, mapTall)

      for (let down = 0; down < plan.down; down += 1) {
        for (let across = 0; across < plan.across; across += 1) {
          const walkable = plan.walkable[down * plan.across + across] === true
          const atX = offX + across * fit
          const atY = offY + down * fit

          if (walkable) {
            surface.fillStyle = '#241d1c'
            surface.fillRect(atX, atY, cell, cell)
            continue
          }

          const touchesFloor =
            (across > 0 && plan.walkable[down * plan.across + across - 1] === true) ||
            (across < plan.across - 1 && plan.walkable[down * plan.across + across + 1] === true) ||
            (down > 0 && plan.walkable[(down - 1) * plan.across + across] === true) ||
            (down < plan.down - 1 && plan.walkable[(down + 1) * plan.across + across] === true)

          if (touchesFloor) {
            surface.fillStyle = '#4a1622'
            surface.fillRect(atX, atY, cell, cell)
          }
        }
      }

      function toMapX(worldX: number): number {
        return offX + (worldX / plan.tileSize) * fit
      }

      function toMapY(worldY: number): number {
        return offY + (worldY / plan.tileSize) * fit
      }

      world.loot.forEach((drop) => {
        if (drop.taken) {
          return
        }
        surface.fillStyle = drop.kind === 'gem' ? '#4a7fc1' : '#c9a227'
        surface.fillRect(toMapX(drop.spot.x) - 1.6, toMapY(drop.spot.y) - 1.6, 3.2, 3.2)
      })

      const beat = 0.5 + Math.sin(now / 320) * 0.5

      world.enemies.forEach((enemy) => {
        if (isDown(enemy)) {
          return
        }
        const gap = Math.hypot(enemy.spot.x - world.you.spot.x, enemy.spot.y - world.you.spot.y)
        const hunting = gap < seenWithin
        const big = enemy.kind === 'demonlord'

        surface.fillStyle = hunting
          ? `rgba(255,61,120,${0.55 + beat * 0.45})`
          : 'rgba(214,21,78,.7)'
        surface.beginPath()
        surface.arc(toMapX(enemy.spot.x), toMapY(enemy.spot.y), big ? 4 : hunting ? 3 : 2.3, 0, 7)
        surface.fill()
      })

      const youX = toMapX(world.you.spot.x)
      const youY = toMapY(world.you.spot.y)

      surface.strokeStyle = `rgba(224,213,196,${0.2 + beat * 0.2})`
      surface.lineWidth = 1
      surface.beginPath()
      surface.arc(youX, youY, 5 + beat * 3, 0, 7)
      surface.stroke()

      surface.fillStyle = '#e0d5c4'
      surface.beginPath()
      surface.moveTo(youX, youY - 4)
      surface.lineTo(youX + 3.2, youY + 3.2)
      surface.lineTo(youX - 3.2, youY + 3.2)
      surface.closePath()
      surface.fill()
    },

    teardown(): void {
      frame.remove()
    }
  }
}
