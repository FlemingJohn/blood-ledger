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

export const champions: Record<RaiderClass, Champion> = {
  warrior: {
    said: 'Warrior',
    line: 'Balanced. Cleaves wide and holds the ground.',
    parts: [
      { d: 'M100 306 L52 300 L64 196 L78 84 L122 84 L136 196 L148 300 Z', fill: 'cloakDark' },
      { d: 'M100 306 L64 302 L74 200 L86 96 L114 96 L126 200 L136 302 Z', fill: 'cloak' },

      { d: 'M100 78 q-26 3 -32 20 l-6 34 q19 9 38 9 q19 0 38 -9 l-6 -34 q-6 -17 -32 -20 z', fill: 'plate' },
      { d: 'M100 78 q-26 3 -32 20 l-3 17 q17 8 35 8 q18 0 35 -8 l-3 -17 q-6 -17 -32 -20 z', fill: 'plateLit' },
      { d: 'M76 108 h48 v4 h-48 z', fill: 'shadow' },

      { d: 'M68 92 q-24 3 -29 22 q-3 15 5 24 q15 -12 33 -14 z', fill: 'plate' },
      { d: 'M132 92 q24 3 29 22 q3 15 -5 24 q-15 -12 -33 -14 z', fill: 'plate' },
      { d: 'M68 92 q-24 3 -29 22 q11 -8 26 -8 z', fill: 'plateLit' },
      { d: 'M132 92 q24 3 29 22 q-11 -8 -26 -8 z', fill: 'plateLit' },

      { d: 'M62 132 l-6 44 q7 5 15 2 l6 -42 z', fill: 'leather' },
      { d: 'M138 132 l6 44 q-7 5 -15 2 l-6 -42 z', fill: 'leather' },
      { d: 'M56 176 l-3 18 q8 4 16 1 l2 -17 z', fill: 'plate' },
      { d: 'M144 176 l3 18 q-8 4 -16 1 l-2 -17 z', fill: 'plate' },

      { d: 'M70 140 h60 l4 20 h-68 z', fill: 'belt' },
      { d: 'M93 145 h14 v12 h-14 z', fill: 'gold' },

      { d: 'M74 160 l-6 88 q9 6 18 2 l5 -88 z', fill: 'leather' },
      { d: 'M126 160 l6 88 q-9 6 -18 2 l-5 -88 z', fill: 'leather' },
      { d: 'M74 160 l-3 40 q8 4 16 1 l2 -40 z', fill: 'leatherLit' },
      { d: 'M126 160 l3 40 q-8 4 -16 1 l-2 -40 z', fill: 'leatherLit' },

      { d: 'M67 248 q12 7 25 3 l3 44 h-30 z', fill: 'plate' },
      { d: 'M133 248 q-12 7 -25 3 l-3 44 h30 z', fill: 'plate' },
      { d: 'M62 292 h38 v14 h-42 z', fill: 'shadow' },
      { d: 'M138 292 h-38 v14 h42 z', fill: 'shadow' },

      { d: 'M100 26 q-22 2 -25 20 l0 24 q10 11 25 11 q15 0 25 -11 l0 -24 q-3 -18 -25 -20 z', fill: 'plate' },
      { d: 'M100 26 q-22 2 -25 20 l0 9 q11 7 25 7 q14 0 25 -7 l0 -9 q-3 -18 -25 -20 z', fill: 'plateLit' },
      { d: 'M78 54 h44 v11 h-44 z', fill: 'shadow' },
      { d: 'M84 57 h12 v6 h-12 z M104 57 h12 v6 h-12 z', fill: 'ember' },
      { d: 'M96 66 h8 v9 h-8 z', fill: 'shadow' },
      { d: 'M100 24 l-6 -22 q6 -5 12 0 z', fill: 'gold' },
      { d: 'M100 2 q-2 -2 0 -2 q2 0 0 2 z', fill: 'molten' },

      { d: 'M95 96 h10 v26 h-10 z', fill: 'leather' },
      { d: 'M100 92 l-7 0 l0 -7 l14 0 l0 7 z', fill: 'gold' },
      { d: 'M76 122 h48 v11 h-48 z', fill: 'gold' },
      { d: 'M100 133 l-9 0 l0 110 l9 22 l9 -22 l0 -110 z', fill: 'steelLit' },
      { d: 'M100 133 l-9 0 l0 110 l9 22 z', fill: 'steel' }
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
