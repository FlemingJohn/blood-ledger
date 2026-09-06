import type { RaiderClass } from '../types/raider'

export type ChampionInk =
  | 'cloak' | 'cloakDark' | 'plate' | 'plateLit'
  | 'leather' | 'leatherLit' | 'belt' | 'gold'
  | 'steel' | 'steelLit' | 'shadow' | 'ember'
  | 'blood' | 'molten'

export interface ChampionPart {
  d: string
  fill: ChampionInk
}

export interface Champion {
  said: string
  line: string
  parts: ChampionPart[]
}

export const inks: Record<ChampionInk, string> = {
  cloak: '#3a1018',
  cloakDark: '#24090f',
  plate: '#4a4f57',
  plateLit: '#6b727c',
  leather: '#4a3226',
  leatherLit: '#65442f',
  belt: '#2a1a14',
  gold: '#c9a227',
  steel: '#5c626b',
  steelLit: '#8a919b',
  shadow: '#140609',
  ember: '#ff3d78',
  blood: '#8b0b2e',
  molten: '#f0a030'
}

export const inkBands: Record<ChampionInk, [string, string]> = {
  cloak: ['#5a1a26', '#240a10'],
  cloakDark: ['#2a0a10', '#120407'],
  plate: ['#7b828d', '#3a3f47'],
  plateLit: ['#a8b0bb', '#5c636d'],
  leather: ['#6b4a33', '#33221a'],
  leatherLit: ['#86603f', '#4a3324'],
  belt: ['#3a251c', '#180e0a'],
  gold: ['#f0d878', '#8a6c1a'],
  steel: ['#8f97a2', '#454b53'],
  steelLit: ['#c6cdd6', '#6b727c'],
  shadow: ['#0d0407', '#050103'],
  ember: ['#ff5a8c', '#c00f3e'],
  blood: ['#a01238', '#5a0620'],
  molten: ['#ffc463', '#d07510']
}

export const champions: Record<RaiderClass, Champion> = {
  warrior: {
    said: 'Warrior',
    line: 'Balanced. Cleaves wide and holds the ground.',
    parts: [
      { d: 'M72 62 L128 62 L152 172 L170 294 Q128 306 100 297 Q72 306 30 294 L48 172 Z', fill: 'cloakDark' },
      { d: 'M80 66 L120 66 L136 176 L150 288 Q100 299 50 288 L64 176 Z', fill: 'cloak' },

      { d: 'M80 166 L100 166 L101 236 L99 292 L81 292 L78 236 Z', fill: 'plate' },
      { d: 'M104 166 L124 166 L127 236 L127 288 L109 290 L105 236 Z', fill: 'plate' },
      { d: 'M80 166 L88 166 L86 236 L82 292 L81 292 L78 236 Z', fill: 'plateLit' },
      { d: 'M104 166 L112 166 L111 236 L110 289 L109 290 L105 236 Z', fill: 'plateLit' },

      { d: 'M77 226 L102 226 L103 245 L76 245 Z', fill: 'plateLit' },
      { d: 'M104 226 L129 226 L129 245 L103 245 Z', fill: 'plateLit' },
      { d: 'M77 243 L103 243 L103 248 L76 248 Z', fill: 'shadow' },
      { d: 'M104 243 L129 243 L129 248 L103 248 Z', fill: 'shadow' },

      { d: 'M74 286 L103 286 L105 306 L71 306 Z', fill: 'plate' },
      { d: 'M103 282 L130 282 L133 302 L103 304 Z', fill: 'plate' },
      { d: 'M71 300 L105 300 L105 306 L71 306 Z', fill: 'shadow' },
      { d: 'M103 297 L133 296 L133 302 L103 304 Z', fill: 'shadow' },

      { d: 'M78 130 L122 130 L128 176 L100 184 L72 176 Z', fill: 'leather' },
      { d: 'M86 130 L114 130 L116 170 L100 176 L84 170 Z', fill: 'leatherLit' },
      { d: 'M72 176 L128 176 L128 181 L72 181 Z', fill: 'shadow' },

      { d: 'M70 66 Q100 57 130 66 L134 102 Q100 115 66 102 Z', fill: 'plate' },
      { d: 'M70 66 Q100 57 130 66 L132 83 Q100 93 68 83 Z', fill: 'plateLit' },
      { d: 'M72 99 L128 99 L130 122 L70 122 Z', fill: 'plate' },
      { d: 'M72 99 L128 99 L129 108 L71 108 Z', fill: 'plateLit' },
      { d: 'M66 100 L134 100 L134 105 L66 105 Z', fill: 'shadow' },

      { d: 'M71 119 L129 119 L130 133 L70 133 Z', fill: 'belt' },
      { d: 'M93 119 L107 119 L108 133 L92 133 Z', fill: 'gold' },

      { d: 'M48 92 L72 90 L74 138 L54 142 Z', fill: 'plate' },
      { d: 'M128 90 L152 92 L146 142 L126 138 Z', fill: 'plate' },
      { d: 'M48 92 L58 91 L60 140 L54 142 Z', fill: 'plateLit' },
      { d: 'M142 91 L152 92 L146 142 L140 140 Z', fill: 'plateLit' },

      { d: 'M52 136 L74 134 L76 166 L56 168 Z', fill: 'plate' },
      { d: 'M126 134 L148 136 L144 168 L124 166 Z', fill: 'plate' },
      { d: 'M52 136 L60 135 L62 167 L56 168 Z', fill: 'plateLit' },
      { d: 'M140 135 L148 136 L144 168 L138 167 Z', fill: 'plateLit' },

      { d: 'M54 164 L78 162 L80 181 L56 183 Z', fill: 'plate' },
      { d: 'M122 162 L146 164 L144 183 L120 181 Z', fill: 'plate' },

      { d: 'M56 64 Q41 73 43 96 Q56 88 77 88 L77 64 Z', fill: 'plate' },
      { d: 'M144 64 Q159 73 157 96 Q144 88 123 88 L123 64 Z', fill: 'plate' },
      { d: 'M56 64 Q41 73 43 96 Q50 82 67 79 Z', fill: 'plateLit' },
      { d: 'M144 64 Q159 73 157 96 Q150 82 133 79 Z', fill: 'plateLit' },

      { d: 'M87 52 L113 52 L117 67 L83 67 Z', fill: 'plate' },
      { d: 'M87 52 L113 52 L114 58 L86 58 Z', fill: 'plateLit' },

      { d: 'M80 34 Q100 18 120 34 L122 46 L78 46 Z', fill: 'plate' },
      { d: 'M80 34 Q100 18 120 34 L121 39 Q100 30 79 39 Z', fill: 'plateLit' },
      { d: 'M78 46 L122 46 L119 57 Q100 61 81 57 Z', fill: 'plate' },
      { d: 'M78 45 L122 45 L122 49 L78 49 Z', fill: 'shadow' },
      { d: 'M85 48 L96 48 L96 54 L85 54 Z M104 48 L115 48 L115 54 L104 54 Z', fill: 'ember' },
      { d: 'M100 32 L94 12 Q100 8 106 12 Z', fill: 'gold' },
      { d: 'M100 10 q-2 -3 0 -3 q2 0 0 3 z', fill: 'molten' },

      { d: 'M128 106 L140 106 L140 116 L128 116 Z', fill: 'gold' },
      { d: 'M130 116 L138 116 L138 144 L130 144 Z', fill: 'belt' },
      { d: 'M116 143 L152 143 L152 152 L116 152 Z', fill: 'gold' },
      { d: 'M127 152 L141 152 L137 266 L134 273 L131 266 Z', fill: 'steelLit' },
      { d: 'M134 152 L141 152 L137 266 L134 273 Z', fill: 'steel' }
    ]
  },

  knight: {
    said: 'Knight',
    line: 'Heavy plate. Slower, but nothing gets past.',
    parts: [
      { d: 'M100 308 L44 302 L58 190 L74 78 L126 78 L142 190 L156 302 Z', fill: 'cloakDark' },
      { d: 'M100 308 L58 304 L70 194 L84 92 L116 92 L130 194 L142 304 Z', fill: 'cloak' },

      { d: 'M100 72 q-32 4 -38 24 l-7 42 q23 11 45 11 q22 0 45 -11 l-7 -42 q-6 -20 -38 -24 z', fill: 'plate' },
      { d: 'M100 72 q-32 4 -38 24 l-4 21 q21 10 42 10 q21 0 42 -10 l-4 -21 q-6 -20 -38 -24 z', fill: 'plateLit' },
      { d: 'M72 104 h56 v5 h-56 z M72 120 h56 v5 h-56 z', fill: 'shadow' },

      { d: 'M62 86 q-28 4 -33 24 q-3 17 6 26 q17 -13 37 -15 z', fill: 'plate' },
      { d: 'M138 86 q28 4 33 24 q3 17 -6 26 q-17 -13 -37 -15 z', fill: 'plate' },
      { d: 'M62 86 q-28 4 -33 24 q13 -9 30 -9 z', fill: 'plateLit' },
      { d: 'M138 86 q28 4 33 24 q-13 -9 -30 -9 z', fill: 'plateLit' },
      { d: 'M46 104 l-8 8 l8 8 l8 -8 z', fill: 'gold' },
      { d: 'M154 104 l8 8 l-8 8 l-8 -8 z', fill: 'gold' },

      { d: 'M64 140 h72 l5 22 h-82 z', fill: 'belt' },
      { d: 'M91 146 h18 v14 h-18 z', fill: 'gold' },

      { d: 'M72 162 l-7 88 q11 7 22 3 l6 -88 z', fill: 'plate' },
      { d: 'M128 162 l7 88 q-11 7 -22 3 l-6 -88 z', fill: 'plate' },
      { d: 'M72 162 l-3 40 q9 4 18 1 l2 -40 z', fill: 'plateLit' },
      { d: 'M128 162 l3 40 q-9 4 -18 1 l-2 -40 z', fill: 'plateLit' },

      { d: 'M64 250 q14 8 28 3 l3 42 h-34 z', fill: 'steel' },
      { d: 'M136 250 q-14 8 -28 3 l-3 42 h34 z', fill: 'steel' },
      { d: 'M58 292 h42 v16 h-46 z', fill: 'shadow' },
      { d: 'M142 292 h-42 v16 h46 z', fill: 'shadow' },

      { d: 'M100 20 q-26 3 -28 24 l0 28 q11 12 28 12 q17 0 28 -12 l0 -28 q-2 -21 -28 -24 z', fill: 'plate' },
      { d: 'M100 20 q-26 3 -28 24 l0 10 q13 7 28 7 q15 0 28 -7 l0 -10 q-2 -21 -28 -24 z', fill: 'plateLit' },
      { d: 'M74 52 h52 v10 h-52 z', fill: 'shadow' },
      { d: 'M81 55 h13 v5 h-13 z M106 55 h13 v5 h-13 z', fill: 'ember' },
      { d: 'M96 64 h8 v16 h-8 z', fill: 'shadow' },
      { d: 'M100 18 l-9 -16 q9 -5 18 0 z', fill: 'blood' },
      { d: 'M100 2 q-3 -2 0 -2 q3 0 0 2 z', fill: 'gold' },

      { d: 'M150 120 q24 5 26 38 l-3 66 q-3 28 -23 37 q-20 -9 -23 -37 l-3 -66 q2 -33 26 -38 z', fill: 'steel' },
      { d: 'M150 120 q24 5 26 38 l-1 31 q-12 7 -25 7 q-13 0 -25 -7 l-1 -31 q2 -33 26 -38 z', fill: 'steelLit' },
      { d: 'M150 140 l-13 26 l13 26 l13 -26 z', fill: 'blood' },
      { d: 'M150 166 l-6 13 l6 13 l6 -13 z', fill: 'gold' },

      { d: 'M44 110 h15 v152 h-15 z', fill: 'steel' },
      { d: 'M44 110 h7 v152 h-7 z', fill: 'steelLit' },
      { d: 'M37 98 h29 v13 h-29 z', fill: 'gold' },
      { d: 'M51 98 l-11 -60 q11 -14 22 0 l-11 60 z', fill: 'steelLit' },
      { d: 'M51 98 l-11 -60 q5 -7 11 -7 l0 67 z', fill: 'steel' }
    ]
  },

  fighter: {
    said: 'Fighter',
    line: 'Quick. Dashes through and cuts three times.',
    parts: [
      { d: 'M100 304 L56 298 L68 192 L82 74 L118 74 L132 192 L144 298 Z', fill: 'cloakDark' },
      { d: 'M100 304 L70 300 L80 196 L90 88 L110 88 L120 196 L130 300 Z', fill: 'cloak' },

      { d: 'M100 80 q-21 4 -25 20 l-5 38 q16 8 30 8 q14 0 30 -8 l-5 -38 q-4 -16 -25 -20 z', fill: 'leather' },
      { d: 'M100 80 q-21 4 -25 20 l-2 19 q14 7 27 7 q13 0 27 -7 l-2 -19 q-4 -16 -25 -20 z', fill: 'leatherLit' },
      { d: 'M86 94 l14 52 l14 -52 l-7 -4 l-7 13 l-7 -13 z', fill: 'shadow' },

      { d: 'M74 94 q-17 4 -20 22 q-2 13 4 20 q11 -10 24 -12 z', fill: 'leather' },
      { d: 'M126 94 q17 4 20 22 q2 13 -4 20 q-11 -10 -24 -12 z', fill: 'leather' },

      { d: 'M75 140 h50 l4 18 h-58 z', fill: 'belt' },
      { d: 'M95 146 h10 v11 h-10 z', fill: 'gold' },
      { d: 'M75 148 l-14 8 l3 6 l14 -7 z', fill: 'leatherLit' },

      { d: 'M79 158 l-6 90 q9 6 17 2 l5 -90 z', fill: 'leather' },
      { d: 'M121 158 l6 90 q-9 6 -17 2 l-5 -90 z', fill: 'leather' },
      { d: 'M79 158 l-3 42 q8 4 15 1 l2 -42 z', fill: 'leatherLit' },
      { d: 'M121 158 l3 42 q-8 4 -15 1 l-2 -42 z', fill: 'leatherLit' },

      { d: 'M72 248 q11 7 23 3 l3 44 h-28 z', fill: 'leatherLit' },
      { d: 'M128 248 q-11 7 -23 3 l-3 44 h28 z', fill: 'leatherLit' },
      { d: 'M66 292 h34 v12 h-38 z', fill: 'shadow' },
      { d: 'M134 292 h-34 v12 h38 z', fill: 'shadow' },

      { d: 'M100 22 q-28 5 -30 32 q-1 19 8 28 q10 -10 22 -10 q12 0 22 10 q9 -9 8 -28 q-2 -27 -30 -32 z', fill: 'cloakDark' },
      { d: 'M100 22 q-28 5 -30 32 q10 -13 30 -13 q20 0 30 13 q-2 -27 -30 -32 z', fill: 'cloak' },
      { d: 'M82 56 q18 -8 36 0 l-4 22 q-14 8 -28 0 z', fill: 'shadow' },
      { d: 'M87 62 h11 v6 h-11 z M102 62 h11 v6 h-11 z', fill: 'ember' },

      { d: 'M57 128 h9 v22 h-9 z', fill: 'leather' },
      { d: 'M48 150 h27 v8 h-27 z', fill: 'gold' },
      { d: 'M61 158 l-8 0 l0 54 l8 16 l8 -16 l0 -54 z', fill: 'steelLit' },
      { d: 'M61 158 l-8 0 l0 54 l8 16 z', fill: 'steel' },

      { d: 'M134 128 h9 v22 h-9 z', fill: 'leather' },
      { d: 'M125 150 h27 v8 h-27 z', fill: 'gold' },
      { d: 'M139 158 l-8 0 l0 54 l8 16 l8 -16 l0 -54 z', fill: 'steelLit' },
      { d: 'M139 158 l-8 0 l0 54 l8 16 z', fill: 'steel' }
    ]
  }
}
