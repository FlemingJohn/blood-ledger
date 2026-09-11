precision highp float;

uniform float uTime;
uniform float uHeat;

varying vec3 vFacing;
varying vec3 vSpot;

const vec3 bloodDeep = vec3(0.169, 0.000, 0.020);
const vec3 emberMid = vec3(0.376, 0.004, 0.063);
const vec3 flareHot = vec3(0.706, 0.078, 0.118);
const vec3 whiteCore = vec3(1.000, 0.745, 0.706);
const vec3 goldHot = vec3(0.788, 0.635, 0.153);

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

  for (int layer = 0; layer < 4; layer++) {
    total += strength * noise(spot);
    spot *= 2.03;
    strength *= 0.5;
  }

  return total;
}

vec3 heatToColour(float heat) {
  vec3 shade = mix(bloodDeep, emberMid, smoothstep(0.02, 0.32, heat));
  shade = mix(shade, flareHot, smoothstep(0.28, 0.68, heat));
  shade = mix(shade, goldHot, smoothstep(0.70, 0.94, heat) * 0.78);
  shade = mix(shade, whiteCore, smoothstep(0.96, 1.00, heat) * 0.30);
  return shade;
}

void main() {
  float facing = clamp(dot(normalize(vFacing), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);

  float rise = uTime * 0.75;
  vec2 churnAt = vSpot.xy * 88.0 + vec2(0.0, rise);

  vec2 curl = vec2(
    layeredNoise(churnAt),
    layeredNoise(churnAt + vec2(4.7, rise * 0.6) + 2.3)
  );

  float churn = layeredNoise(churnAt * 1.5 + curl * 2.4);

  float core = pow(facing, 3.2);
  float body = pow(facing, 1.2);

  float heat = core * 0.66 + body * 0.30 + churn * 0.26 * body;
  heat = clamp(heat * uHeat, 0.0, 1.0);

  vec3 shade = heatToColour(heat);

  float falloff = smoothstep(0.0, 0.55, facing) * (0.62 + churn * 0.58);

  gl_FragColor = vec4(shade * falloff * 2.4, 1.0);
}
