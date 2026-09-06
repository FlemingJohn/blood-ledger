import type { RaiderClass } from '../types/raider'
import { champions, inks } from '../art/champions'

const drawnIn = 'http://www.w3.org/2000/svg'

export type MarkName =
  | 'scales'
  | 'blade'
  | 'coin'
  | 'skull'
  | 'shield'
  | 'warning'
  | 'stair'
  | 'seal'
  | 'corner'

const strokes: Record<MarkName, string[]> = {
  scales: [
    'M12 3v16',
    'M6 19h12',
    'M4 8h16',
    'M4 8l-2.5 5a3 3 0 0 0 5 0z',
    'M20 8l2.5 5a3 3 0 0 1-5 0z'
  ],
  blade: ['M13 2l3 3-8.5 8.5L4 17l-1-1 3.5-3.5z', 'M4 17l-1.5 4.5L7 20', 'M14.5 6.5l3 3'],
  coin: ['M12 3a9 4.5 0 1 0 0 9a9 4.5 0 1 0 0-9z', 'M3 7.5v7c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-7'],
  skull: [
    'M12 2a8 8 0 0 0-8 8v3l2 2v3h12v-3l2-2v-3a8 8 0 0 0-8-8z',
    'M9 11.5a1.6 1.6 0 1 0 0-.1',
    'M15 11.5a1.6 1.6 0 1 0 0-.1',
    'M11 16h2'
  ],
  shield: ['M12 2l8 3v7c0 5-4 8.5-8 10c-4-1.5-8-5-8-10V5z', 'M12 8v6'],
  warning: ['M12 3l9.5 17h-19z', 'M12 9v5', 'M12 17.2v.1'],
  stair: ['M3 20h4v-4h4v-4h4V8h4V4', 'M3 20h18'],
  corner: [
    'M2 2h9M2 2v9',
    'M2 2l7 7',
    'M4 7h3v-3'
  ],
  seal: [
    'M12 2l2.6 1.7 3.1-.4 1 3 2.6 1.8-1.4 2.8 1.4 2.8-2.6 1.8-1 3-3.1-.4L12 20l-2.6-1.9-3.1.4-1-3L2.7 13.7 4.1 11 2.7 8.2l2.6-1.8 1-3 3.1.4z',
    'M9.5 12l1.8 1.8L15 10'
  ]
}

export interface MarkOrder {
  name: MarkName
  size?: number
  className?: string
  title?: string
}

export function drawMark(order: MarkOrder): SVGSVGElement {
  const size = order.size ?? 18

  const mark = document.createElementNS(drawnIn, 'svg')
  mark.setAttribute('viewBox', '0 0 24 24')
  mark.setAttribute('width', String(size))
  mark.setAttribute('height', String(size))
  mark.setAttribute('fill', 'none')
  mark.setAttribute('stroke', 'currentColor')
  mark.setAttribute('stroke-width', '1.6')
  mark.setAttribute('stroke-linecap', 'round')
  mark.setAttribute('stroke-linejoin', 'round')
  mark.setAttribute('class', `mark ${order.className ?? ''}`.trim())

  if (order.title) {
    const said = document.createElementNS(drawnIn, 'title')
    said.textContent = order.title
    mark.append(said)
  } else {
    mark.setAttribute('aria-hidden', 'true')
  }

  strokes[order.name].forEach((line) => {
    const drawn = document.createElementNS(drawnIn, 'path')
    drawn.setAttribute('d', line)
    mark.append(drawn)
  })

  return mark
}

const highestStanding = 1000

export interface SigilOrder {
  score: number
  size?: number
}

export function drawSigil(order: SigilOrder): SVGSVGElement {
  const size = order.size ?? 74
  const middle = 50
  const radius = 40
  const wholeWayRound = 2 * Math.PI * radius
  const filled = Math.max(0, Math.min(1, order.score / highestStanding))

  const sigil = document.createElementNS(drawnIn, 'svg')
  sigil.setAttribute('viewBox', '0 0 100 100')
  sigil.setAttribute('width', String(size))
  sigil.setAttribute('height', String(size))
  sigil.setAttribute('class', 'sigil')
  sigil.setAttribute('aria-hidden', 'true')

  const behind = document.createElementNS(drawnIn, 'circle')
  behind.setAttribute('cx', String(middle))
  behind.setAttribute('cy', String(middle))
  behind.setAttribute('r', String(radius))
  behind.setAttribute('fill', 'none')
  behind.setAttribute('stroke', 'currentColor')
  behind.setAttribute('stroke-width', '5')
  behind.setAttribute('class', 'sigil__behind')

  const ahead = document.createElementNS(drawnIn, 'circle')
  ahead.setAttribute('cx', String(middle))
  ahead.setAttribute('cy', String(middle))
  ahead.setAttribute('r', String(radius))
  ahead.setAttribute('fill', 'none')
  ahead.setAttribute('stroke', 'currentColor')
  ahead.setAttribute('stroke-width', '5')
  ahead.setAttribute('stroke-linecap', 'butt')
  ahead.setAttribute('stroke-dasharray', `${wholeWayRound * filled} ${wholeWayRound}`)
  ahead.setAttribute('transform', `rotate(-90 ${middle} ${middle})`)
  ahead.setAttribute('class', 'sigil__ahead')

  const notches = document.createElementNS(drawnIn, 'g')
  notches.setAttribute('class', 'sigil__notches')

  for (let notch = 0; notch < 12; notch += 1) {
    const at = (notch / 12) * Math.PI * 2 - Math.PI / 2
    const from = radius + 5
    const to = radius + 9
    const line = document.createElementNS(drawnIn, 'line')
    line.setAttribute('x1', String(middle + Math.cos(at) * from))
    line.setAttribute('y1', String(middle + Math.sin(at) * from))
    line.setAttribute('x2', String(middle + Math.cos(at) * to))
    line.setAttribute('y2', String(middle + Math.sin(at) * to))
    line.setAttribute('stroke', 'currentColor')
    line.setAttribute('stroke-width', '1.4')
    notches.append(line)
  }

  const said = document.createElementNS(drawnIn, 'text')
  said.setAttribute('x', String(middle))
  said.setAttribute('y', String(middle))
  said.setAttribute('text-anchor', 'middle')
  said.setAttribute('dominant-baseline', 'central')
  said.setAttribute('class', 'sigil__score')
  said.textContent = String(order.score)

  sigil.append(notches, behind, ahead, said)
  return sigil
}

export function drawChampion(who: RaiderClass, tall: number): SVGSVGElement {
  const kit = champions[who]

  const drawn = document.createElementNS(drawnIn, 'svg')
  drawn.setAttribute('viewBox', '0 0 200 320')
  drawn.setAttribute('height', String(tall))
  drawn.setAttribute('width', String(Math.round((tall * 200) / 320)))
  drawn.setAttribute('class', 'champion')
  drawn.setAttribute('role', 'img')

  const said = document.createElementNS(drawnIn, 'title')
  said.textContent = kit.said
  drawn.append(said)

  kit.parts.forEach((part) => {
    const path = document.createElementNS(drawnIn, 'path')
    path.setAttribute('d', part.d)
    path.setAttribute('fill', inks[part.fill])
    drawn.append(path)
  })

  return drawn
}

export function drawAlcove(): SVGSVGElement {
  const alcove = document.createElementNS(drawnIn, 'svg')
  alcove.setAttribute('viewBox', '0 0 420 300')
  alcove.setAttribute('preserveAspectRatio', 'xMidYMax meet')
  alcove.setAttribute('class', 'alcove')
  alcove.setAttribute('aria-hidden', 'true')

  const defs = document.createElementNS(drawnIn, 'defs')

  const wall = document.createElementNS(drawnIn, 'linearGradient')
  wall.setAttribute('id', 'alcoveWall')
  wall.setAttribute('x1', '0')
  wall.setAttribute('y1', '0')
  wall.setAttribute('x2', '0')
  wall.setAttribute('y2', '1')
  ;[['0%', '#1a0d12'], ['100%', '#0a0307']].forEach(([at, tone]) => {
    const stop = document.createElementNS(drawnIn, 'stop')
    stop.setAttribute('offset', at as string)
    stop.setAttribute('stop-color', tone as string)
    wall.append(stop)
  })
  defs.append(wall)

  const glow = document.createElementNS(drawnIn, 'radialGradient')
  glow.setAttribute('id', 'alcoveGlow')
  ;[
    ['0%', '#ff9a50', '.42'],
    ['45%', '#d6154e', '.15'],
    ['100%', '#8b0b2e', '0']
  ].forEach(([at, tone, through]) => {
    const stop = document.createElementNS(drawnIn, 'stop')
    stop.setAttribute('offset', at as string)
    stop.setAttribute('stop-color', tone as string)
    stop.setAttribute('stop-opacity', through as string)
    glow.append(stop)
  })
  defs.append(glow)

  const hatch = document.createElementNS(drawnIn, 'pattern')
  hatch.setAttribute('id', 'alcoveHatch')
  hatch.setAttribute('width', '8')
  hatch.setAttribute('height', '8')
  hatch.setAttribute('patternUnits', 'userSpaceOnUse')
  hatch.setAttribute('patternTransform', 'rotate(135)')
  const streak = document.createElementNS(drawnIn, 'line')
  streak.setAttribute('x1', '0')
  streak.setAttribute('y1', '0')
  streak.setAttribute('x2', '0')
  streak.setAttribute('y2', '8')
  streak.setAttribute('stroke', '#2c0d16')
  streak.setAttribute('stroke-width', '2.5')
  hatch.append(streak)
  defs.append(hatch)

  alcove.append(defs)

  function shape(name: string, bits: Record<string, string>): void {
    const made = document.createElementNS(drawnIn, name)
    Object.entries(bits).forEach(([key, worth]) => made.setAttribute(key, worth))
    alcove.append(made)
  }

  shape('rect', { x: '60', y: '20', width: '300', height: '230', fill: 'url(#alcoveWall)' })
  shape('rect', { x: '60', y: '20', width: '300', height: '230', fill: 'url(#alcoveHatch)', opacity: '.5' })

  shape('path', { d: 'M60 96 A150 96 0 0 1 360 96 L360 40 L60 40 Z', fill: '#0a0307' })
  shape('path', { d: 'M60 96 A150 96 0 0 1 360 96', fill: 'none', stroke: '#4a1622', 'stroke-width': '5' })

  ;[96, 324].forEach((atX) => {
    shape('rect', { x: String(atX - 26), y: '60', width: '52', height: '190', fill: '#1c0e14', stroke: '#3a1520', 'stroke-width': '2' })
    shape('rect', { x: String(atX - 32), y: '52', width: '64', height: '14', fill: '#241118', stroke: '#3a1520', 'stroke-width': '2' })
    shape('rect', { x: String(atX - 32), y: '236', width: '64', height: '16', fill: '#241118', stroke: '#3a1520', 'stroke-width': '2' })
    for (let band = 90; band < 236; band += 34) {
      shape('line', { x1: String(atX - 26), y1: String(band), x2: String(atX + 26), y2: String(band), stroke: '#0d0509', 'stroke-width': '2' })
    }
    shape('circle', { cx: String(atX), cy: '150', r: '108', fill: 'url(#alcoveGlow)' })
    shape('rect', { x: String(atX - 11), y: '126', width: '22', height: '12', fill: '#3a1a18', stroke: '#5a2a22', 'stroke-width': '1.5' })
    shape('path', {
      d: `M${atX - 7} 126 q3 -14 1 -20 q6 8 5 20 q4 -6 3 -12 q5 10 2 12 z`,
      fill: '#ff8a3c',
      opacity: '.9',
      class: 'alcove__fire'
    })
  })

  shape('rect', { x: '178', y: '34', width: '64', height: '26', fill: '#2a121a', stroke: '#4a1622', 'stroke-width': '2' })

  shape('path', { d: 'M120 250 L300 250 L340 268 L80 268 Z', fill: '#1e1015', stroke: '#3a1520', 'stroke-width': '2' })
  shape('path', { d: 'M140 236 L280 236 L300 250 L120 250 Z', fill: '#261419', stroke: '#3a1520', 'stroke-width': '2' })
  shape('ellipse', { cx: '210', cy: '236', rx: '66', ry: '9', fill: '#0d0509', opacity: '.8' })

  return alcove
}
