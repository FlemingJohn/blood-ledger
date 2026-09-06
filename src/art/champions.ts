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
      { d: 'M74 62 L126 62 L142 160 L152 250 Q126 262 100 256 Q74 262 48 250 L58 160 Z', fill: 'cloakDark' },
      { d: 'M82 66 L118 66 L130 164 L136 246 Q100 256 64 246 L70 164 Z', fill: 'cloak' },
      { d: 'M78 166 L102 166 L103 238 L101 292 L79 292 L76 238 Z', fill: 'plate' },
      { d: 'M104 166 L128 166 L130 238 L128 290 L106 292 L104 238 Z', fill: 'plate' },
      { d: 'M78 166 L87 166 L85 238 L81 292 L79 292 L76 238 Z', fill: 'plateLit' },
      { d: 'M104 166 L113 166 L112 238 L110 291 L106 292 L104 238 Z', fill: 'plateLit' },
      { d: 'M76 226 L104 226 L105 248 L75 248 Z', fill: 'plateLit' },
      { d: 'M104 226 L131 226 L131 248 L103 248 Z', fill: 'plateLit' },
      { d: 'M75 246 L105 246 L105 251 L74 251 Z', fill: 'shadow' },
      { d: 'M104 246 L131 246 L131 251 L103 251 Z', fill: 'shadow' },
      { d: 'M72 286 L104 286 L107 306 L69 306 Z', fill: 'plate' },
      { d: 'M104 284 L133 284 L136 304 L104 306 Z', fill: 'plate' },
      { d: 'M69 300 L107 300 L107 306 L69 306 Z', fill: 'shadow' },
      { d: 'M104 298 L136 297 L136 304 L104 306 Z', fill: 'shadow' },
      { d: 'M76 128 L124 128 L130 196 L100 204 L70 196 Z', fill: 'cloak' },
      { d: 'M84 128 L116 128 L120 190 L100 197 L80 190 Z', fill: 'blood' },
      { d: 'M70 196 L130 196 L130 201 L70 201 Z', fill: 'shadow' },
      { d: 'M66 64 Q100 54 134 64 L138 104 Q100 118 62 104 Z', fill: 'plate' },
      { d: 'M66 64 Q100 54 134 64 L136 82 Q100 92 64 82 Z', fill: 'plateLit' },
      { d: 'M68 100 L132 100 L134 124 L66 124 Z', fill: 'plate' },
      { d: 'M68 100 L132 100 L133 110 L67 110 Z', fill: 'plateLit' },
      { d: 'M62 101 L138 101 L138 106 L62 106 Z', fill: 'shadow' },
      { d: 'M98 64 L102 64 L102 122 L98 122 Z', fill: 'plateLit' },
      { d: 'M70 117 L130 117 L131 133 L69 133 Z', fill: 'belt' },
      { d: 'M92 117 L108 117 L109 133 L91 133 Z', fill: 'gold' },
      { d: 'M44 92 L70 90 L72 140 L50 144 Z', fill: 'plate' },
      { d: 'M130 90 L156 92 L150 144 L128 140 Z', fill: 'plate' },
      { d: 'M44 92 L54 91 L56 142 L50 144 Z', fill: 'plateLit' },
      { d: 'M146 91 L156 92 L150 144 L144 142 Z', fill: 'plateLit' },
      { d: 'M48 140 L74 138 L76 162 L50 164 Z', fill: 'plate' },
      { d: 'M126 138 L152 140 L150 164 L124 162 Z', fill: 'plate' },
      { d: 'M52 60 Q34 70 36 98 Q52 88 78 88 L78 60 Z', fill: 'plate' },
      { d: 'M148 60 Q166 70 164 98 Q148 88 122 88 L122 60 Z', fill: 'plate' },
      { d: 'M52 60 Q34 70 36 98 Q46 80 66 76 Z', fill: 'plateLit' },
      { d: 'M148 60 Q166 70 164 98 Q154 80 134 76 Z', fill: 'plateLit' },
      { d: 'M86 50 L114 50 L118 66 L82 66 Z', fill: 'plate' },
      { d: 'M86 50 L114 50 L115 56 L85 56 Z', fill: 'plateLit' },
      { d: 'M82 24 Q100 20 118 24 L122 42 L78 42 Z', fill: 'plate' },
      { d: 'M82 24 Q100 20 118 24 L120 30 Q100 26 80 30 Z', fill: 'plateLit' },
      { d: 'M78 42 L122 42 L120 58 Q100 62 80 58 Z', fill: 'plate' },
      { d: 'M78 41 L122 41 L122 45 L78 45 Z', fill: 'shadow' },
      { d: 'M84 46 L116 46 L116 52 L84 52 Z', fill: 'shadow' },
      { d: 'M86 47 L114 47 L114 51 L86 51 Z', fill: 'ember' },
      { d: 'M97 54 L103 54 L103 60 L97 60 Z', fill: 'shadow' },
      { d: 'M96 22 L104 22 L104 8 L96 8 Z', fill: 'gold' },
      { d: 'M100 8 q-3 -4 0 -4 q3 0 0 4 z', fill: 'molten' },
      { d: 'M28 96 L64 96 L66 150 Q46 178 28 150 Z', fill: 'steel' },
      { d: 'M32 100 L60 100 L62 148 Q46 168 32 148 Z', fill: 'steelLit' },
      { d: 'M40 118 L54 118 L54 132 L40 132 Z', fill: 'gold' },
      { d: 'M132 100 L142 100 L142 110 L132 110 Z', fill: 'gold' },
      { d: 'M134 110 L140 110 L140 138 L134 138 Z', fill: 'belt' },
      { d: 'M118 137 L156 137 L156 146 L118 146 Z', fill: 'gold' },
      { d: 'M129 146 L145 146 L140 262 L137 270 L134 262 Z', fill: 'steelLit' },
      { d: 'M137 146 L145 146 L140 262 L137 270 Z', fill: 'steel' }
    ]
  },

  fighter: {
    said: 'Fighter',
    line: 'Quick. Dashes through and cuts three times.',
    parts: [
      { d: 'M78 64 L122 64 L140 140 L150 210 Q120 220 100 214 Q80 220 54 210 L62 140 Z', fill: 'cloakDark' },
      { d: 'M86 68 L114 68 L124 144 L130 204 Q100 212 70 204 L78 144 Z', fill: 'cloak' },
      { d: 'M82 164 L100 164 L101 234 L99 292 L83 292 L80 234 Z', fill: 'leather' },
      { d: 'M104 164 L122 164 L124 234 L123 290 L107 292 L104 234 Z', fill: 'leather' },
      { d: 'M82 164 L89 164 L87 234 L84 292 L83 292 L80 234 Z', fill: 'leatherLit' },
      { d: 'M104 164 L111 164 L110 234 L109 291 L107 292 L104 234 Z', fill: 'leatherLit' },
      { d: 'M79 212 L102 212 L102 221 L78 221 Z', fill: 'belt' },
      { d: 'M104 212 L126 212 L126 221 L103 221 Z', fill: 'belt' },
      { d: 'M79 243 L102 243 L102 252 L78 252 Z', fill: 'belt' },
      { d: 'M104 243 L126 243 L126 252 L103 252 Z', fill: 'belt' },
      { d: 'M78 286 L102 286 L104 306 L75 306 Z', fill: 'leather' },
      { d: 'M104 284 L127 284 L129 303 L104 305 Z', fill: 'leather' },
      { d: 'M75 300 L104 300 L104 306 L75 306 Z', fill: 'shadow' },
      { d: 'M104 297 L129 296 L129 303 L104 305 Z', fill: 'shadow' },
      { d: 'M80 126 L120 126 L124 162 L100 168 L76 162 Z', fill: 'leather' },
      { d: 'M86 126 L114 126 L116 158 L100 163 L84 158 Z', fill: 'leatherLit' },
      { d: 'M76 162 L124 162 L124 167 L76 167 Z', fill: 'shadow' },
      { d: 'M74 66 Q100 58 126 66 L130 100 Q100 112 70 100 Z', fill: 'leather' },
      { d: 'M74 66 Q100 58 126 66 L128 82 Q100 90 72 82 Z', fill: 'leatherLit' },
      { d: 'M78 70 L122 100 L118 107 L74 77 Z', fill: 'belt' },
      { d: 'M122 70 L78 100 L82 107 L126 77 Z', fill: 'belt' },
      { d: 'M88 78 L112 78 L114 97 L86 97 Z', fill: 'steel' },
      { d: 'M88 78 L112 78 L113 85 L87 85 Z', fill: 'steelLit' },
      { d: 'M74 115 L126 115 L127 129 L73 129 Z', fill: 'belt' },
      { d: 'M94 115 L106 115 L107 129 L93 129 Z', fill: 'gold' },
      { d: 'M52 90 L74 88 L76 136 L58 140 Z', fill: 'leather' },
      { d: 'M126 88 L148 90 L142 140 L124 136 Z', fill: 'leather' },
      { d: 'M52 90 L60 89 L62 138 L58 140 Z', fill: 'leatherLit' },
      { d: 'M56 134 L76 132 L78 156 L58 158 Z', fill: 'steel' },
      { d: 'M124 132 L144 134 L142 158 L122 156 Z', fill: 'steel' },
      { d: 'M58 155 L78 153 L80 171 L60 173 Z', fill: 'leather' },
      { d: 'M120 153 L140 155 L138 173 L118 171 Z', fill: 'leather' },
      { d: 'M60 64 Q48 72 50 92 Q62 86 80 86 L80 64 Z', fill: 'steel' },
      { d: 'M60 64 Q48 72 50 92 Q56 80 70 77 Z', fill: 'steelLit' },
      { d: 'M120 64 L142 68 L140 88 L122 86 Z', fill: 'leather' },
      { d: 'M80 36 Q100 20 120 36 L124 54 Q100 64 76 54 Z', fill: 'cloak' },
      { d: 'M80 36 Q100 20 120 36 L122 43 Q100 35 78 43 Z', fill: 'cloakDark' },
      { d: 'M84 42 L116 42 L114 58 Q100 63 86 58 Z', fill: 'shadow' },
      { d: 'M88 46 L97 46 L97 52 L88 52 Z M103 46 L112 46 L112 52 L103 52 Z', fill: 'ember' },
      { d: 'M50 168 L62 168 L62 177 L50 177 Z', fill: 'gold' },
      { d: 'M53 177 L59 177 L56 220 Z', fill: 'steelLit' },
      { d: 'M138 168 L150 168 L150 177 L138 177 Z', fill: 'gold' },
      { d: 'M141 177 L147 177 L144 220 Z', fill: 'steelLit' }
    ]
  }
}
