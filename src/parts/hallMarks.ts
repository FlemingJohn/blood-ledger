const drawnIn = 'http://www.w3.org/2000/svg'

function openCanvas(wide: number, tall: number, named: string): SVGSVGElement {
  const drawn = document.createElementNS(drawnIn, 'svg')
  drawn.setAttribute('viewBox', `0 0 ${wide} ${tall}`)
  drawn.setAttribute('class', named)
  drawn.setAttribute('aria-hidden', 'true')
  drawn.setAttribute('focusable', 'false')
  return drawn
}

function lay(into: SVGSVGElement, d: string, fill: string, opacity?: string): void {
  const path = document.createElementNS(drawnIn, 'path')
  path.setAttribute('d', d)
  path.setAttribute('fill', fill)
  if (opacity) {
    path.setAttribute('opacity', opacity)
  }
  into.append(path)
}

export function drawTorchBracket(): SVGSVGElement {
  const torch = openCanvas(60, 92, 'bracket')

  const halo = document.createElementNS(drawnIn, 'ellipse')
  halo.setAttribute('cx', '30')
  halo.setAttribute('cy', '44')
  halo.setAttribute('rx', '22')
  halo.setAttribute('ry', '26')
  halo.setAttribute('fill', '#ff8a2b')
  halo.setAttribute('opacity', '0.1')
  torch.append(halo)

  lay(torch, 'M22 8 L38 8 L36 20 L24 20 Z', '#2c0d16')
  lay(torch, 'M26 20 L34 20 L33 62 L27 62 Z', '#3a1b12')
  lay(torch, 'M18 62 L42 62 L38 72 L22 72 Z', '#2c0d16')
  lay(torch, 'M30 26 q-9 12 -5 21 q3 7 5 9 q2 -2 5 -9 q4 -9 -5 -21 z', '#d6154e', '0.85')
  lay(torch, 'M30 33 q-5 8 -3 14 q2 4 3 5 q1 -1 3 -5 q2 -6 -3 -14 z', '#f0a030')

  return torch
}

export function drawWaxSeal(): SVGSVGElement {
  const seal = openCanvas(60, 60, 'seal')

  lay(seal, 'M14 40 q6 10 16 12 q-14 4 -18 -4 z', '#7a0c26')

  const disc = document.createElementNS(drawnIn, 'circle')
  disc.setAttribute('cx', '30')
  disc.setAttribute('cy', '32')
  disc.setAttribute('r', '18')
  disc.setAttribute('fill', '#7a0c26')
  disc.setAttribute('stroke', '#a81338')
  disc.setAttribute('stroke-width', '1.5')
  seal.append(disc)

  lay(seal, 'M30 15 q8 6 6 14 q-2 8 -6 10 q-4 -2 -6 -10 q-2 -8 6 -14 z', '#5c0819', '0.7')

  const mark = document.createElementNS(drawnIn, 'path')
  mark.setAttribute('d', 'M23 27 L37 27 L35 42 L30 46 L25 42 Z M30 27 L30 46')
  mark.setAttribute('fill', 'none')
  mark.setAttribute('stroke', '#e0d5c4')
  mark.setAttribute('stroke-width', '1.4')
  mark.setAttribute('opacity', '0.65')
  seal.append(mark)

  return seal
}

export function drawChain(): SVGSVGElement {
  const chain = openCanvas(40, 92, 'chain')

  const tones = ['#4a3f44', '#5c5056', '#4a3f44', '#5c5056']

  tones.forEach((tone, step) => {
    const link = document.createElementNS(drawnIn, 'ellipse')
    link.setAttribute('cx', '20')
    link.setAttribute('cy', String(16 + step * 22))
    link.setAttribute('rx', '7')
    link.setAttribute('ry', '12')
    link.setAttribute('fill', 'none')
    link.setAttribute('stroke', tone)
    link.setAttribute('stroke-width', '3')
    chain.append(link)
  })

  return chain
}

export function drawScales(): SVGSVGElement {
  const scales = openCanvas(92, 82, 'scales')

  const drawn = document.createElementNS(drawnIn, 'g')
  drawn.setAttribute('fill', 'none')
  drawn.setAttribute('stroke', '#8b0b2e')
  drawn.setAttribute('stroke-width', '2')
  drawn.setAttribute('stroke-linecap', 'round')
  drawn.setAttribute('stroke-linejoin', 'round')

  const beams = [
    'M46 12 L46 70',
    'M24 70 L68 70',
    'M16 28 L76 28',
    'M16 28 L7 46 a11 11 0 0 0 18 0 z',
    'M76 28 L85 46 a11 11 0 0 1 -18 0 z'
  ]

  beams.forEach((d) => {
    const path = document.createElementNS(drawnIn, 'path')
    path.setAttribute('d', d)
    drawn.append(path)
  })

  const pin = document.createElementNS(drawnIn, 'circle')
  pin.setAttribute('cx', '46')
  pin.setAttribute('cy', '20')
  pin.setAttribute('r', '4')
  drawn.append(pin)

  scales.append(drawn)
  return scales
}

export function drawBinding(): SVGSVGElement {
  const binding = openCanvas(34, 92, 'binding')
  binding.setAttribute('preserveAspectRatio', 'none')

  lay(binding, 'M6 0 L20 0 L20 92 L6 92 Z', '#2c0d16')
  lay(binding, 'M6 0 L10 0 L10 92 L6 92 Z', '#4a2028')

  const stitches = document.createElementNS(drawnIn, 'g')
  stitches.setAttribute('stroke', '#7d6a70')
  stitches.setAttribute('stroke-width', '1.6')
  stitches.setAttribute('stroke-linecap', 'round')
  stitches.setAttribute('opacity', '0.55')

  for (let at = 10; at < 92; at += 16) {
    const thread = document.createElementNS(drawnIn, 'path')
    thread.setAttribute('d', `M13 ${at} L27 ${at - 4}`)
    stitches.append(thread)
  }

  binding.append(stitches)
  return binding
}

export function drawCoinStack(): SVGSVGElement {
  const stack = openCanvas(64, 60, 'coinstack')

  const coins: [number, number, string][] = [
    [46, 20, '#8a6c1a'],
    [42, 20, '#c9a227'],
    [34, 18, '#8a6c1a'],
    [31, 18, '#d8b43a'],
    [23, 16, '#8a6c1a'],
    [20, 16, '#f0d878']
  ]

  coins.forEach(([down, across, tone]) => {
    const coin = document.createElementNS(drawnIn, 'ellipse')
    coin.setAttribute('cx', '32')
    coin.setAttribute('cy', String(down))
    coin.setAttribute('rx', String(across))
    coin.setAttribute('ry', String(across * 0.36))
    coin.setAttribute('fill', tone)
    stack.append(coin)
  })

  const slot = document.createElementNS(drawnIn, 'ellipse')
  slot.setAttribute('cx', '32')
  slot.setAttribute('cy', '20')
  slot.setAttribute('rx', '7')
  slot.setAttribute('ry', '2.6')
  slot.setAttribute('fill', '#8a6c1a')
  slot.setAttribute('opacity', '0.6')
  stack.append(slot)

  return stack
}
