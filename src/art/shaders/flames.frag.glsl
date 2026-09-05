precision highp float;

uniform vec2 uSize;
uniform float uTime;

const vec3 voidBlack = vec3(0.039, 0.012, 0.027);
const vec3 bloodDeep = vec3(0.545, 0.043, 0.180);
const vec3 emberMid = vec3(0.839, 0.082, 0.306);
const vec3 flareHot = vec3(1.000, 0.239, 0.471);
const vec3 whiteCore = vec3(1.000, 0.851, 0.894);

float hash(vec2 seed) {
  vec2 wrapped = fract(seed * vec2(123.34, 456.21));
  wrapped += dot(wrapped, wrapped + 45.32);
  return fract(wrapped.x * wrapped.y);
}

float noise(vec2 spot) {
  vec2 cell = floor(spot);
  vec2 into = fract(spot);
  vec2 eased = into * into * (3.0 - 2.0 * into);

  float corner00 = hash(cell);
  float corner10 = hash(cell + vec2(1.0, 0.0));
  float corner01 = hash(cell + vec2(0.0, 1.0));
  float corner11 = hash(cell + vec2(1.0, 1.0));

  return mix(mix(corner00, corner10, eased.x), mix(corner01, corner11, eased.x), eased.y);
}

float layeredNoise(vec2 spot) {
  float total = 0.0;
  float strength = 0.5;

  for (int layer = 0; layer < 5; layer++) {
    total += strength * noise(spot);
    spot *= 2.03;
    strength *= 0.5;
  }

  return total;
}

vec3 heatToColour(float heat) {
  vec3 shade = mix(voidBlack, bloodDeep, smoothstep(0.04, 0.42, heat));
  shade = mix(shade, emberMid, smoothstep(0.38, 0.70, heat));
  shade = mix(shade, flareHot, smoothstep(0.66, 0.87, heat));
  shade = mix(shade, whiteCore, smoothstep(0.93, 1.00, heat) * 0.65);
  return shade;
}

void main() {
  vec2 screen = gl_FragCoord.xy / uSize;
  vec2 wide = screen * vec2(uSize.x / uSize.y, 1.0);

  float rise = uTime * 0.19;

  vec2 curl = vec2(
    layeredNoise(wide * 2.6 + vec2(0.0, rise)),
    layeredNoise(wide * 2.6 + vec2(5.2, rise * 1.27) + 1.7)
  );

  float fire = layeredNoise(wide * 3.3 + curl * 1.7 + vec2(0.0, rise * 1.55));

  float fromEdge = min(screen.x, 1.0 - screen.x);
  float edgeMask = 1.0 - smoothstep(0.03, 0.40, fromEdge);

  float topFade = mix(1.0, 0.52, smoothstep(0.30, 1.0, screen.y));
  float footFade = smoothstep(-0.10, 0.22, screen.y);

  float heat = fire * edgeMask * topFade * footFade;
  heat = pow(heat, 1.45) * 1.95;

  float smoke = layeredNoise(wide * 1.15 + vec2(rise * 0.32, rise * 0.52));
  heat += smoke * 0.11 * edgeMask;

  float bloom = 1.0 - smoothstep(0.0, 0.62, distance(screen, vec2(0.5, 0.70)));
  heat += bloom * bloom * 0.38;

  vec3 shade = heatToColour(clamp(heat, 0.0, 1.0));
  shade = mix(shade, voidBlack, smoothstep(0.30, -0.05, screen.y) * 0.85);

  gl_FragColor = vec4(shade, 1.0);
}
