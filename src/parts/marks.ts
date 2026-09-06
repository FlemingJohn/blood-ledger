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

/**
 * The standing sigil: a ring that fills as a raider is trusted, with the
 * number cut into the middle of it. Drawn rather than written, because a
 * number in a row of numbers is a metric and this is meant to be a rank.
 */
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
