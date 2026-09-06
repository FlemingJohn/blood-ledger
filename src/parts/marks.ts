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
