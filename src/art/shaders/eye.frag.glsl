precision highp float;

uniform float uTime;
uniform float uHeat;

varying vec2 vUv;

const vec3 voidBlack = vec3(0.012, 0.004, 0.004);
const vec3 bloodDeep = vec3(0.169, 0.000, 0.020);
const vec3 emberMid = vec3(0.376, 0.004, 0.063);
const vec3 flareHot = vec3(0.706, 0.078, 0.118);
const vec3 whiteCore = vec3(1.000, 0.745, 0.706);

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
  vec3 shade = mix(voidBlack, bloodDeep, smoothstep(0.03, 0.34, heat));
  shade = mix(shade, emberMid, smoothstep(0.32, 0.74, heat));
  shade = mix(shade, flareHot, smoothstep(0.82, 0.99, heat));
  shade = mix(shade, whiteCore, smoothstep(0.99, 1.00, heat) * 0.05);
  return shade;
}

void main() {
  vec2 uv = vUv;

  float rise = uTime * 1.9;
  float up = uv.y;

  vec2 curl = vec2(
    layeredNoise(uv * vec2(3.4, 1.5) - vec2(0.0, rise * 0.7)),
    layeredNoise(uv * vec2(3.4, 1.5) - vec2(3.7, rise * 0.96) + 1.9)
  );

  float wander = (curl.x - 0.5) * 0.52 * pow(up, 1.3);
  float leans = abs(uv.x - 0.5 + wander);

  float licking = layeredNoise(uv * vec2(5.2, 2.0) + curl * 2.2 - vec2(0.0, rise * 1.35));
  float faster = layeredNoise(uv * vec2(9.5, 3.6) + curl * 1.2 - vec2(0.0, rise * 2.15));

  float fuel = licking * 0.62 + faster * 0.48;
  fuel = clamp((fuel - 0.30) * 2.35, 0.0, 1.0);

  vec2 fromSocket = vec2(uv.x - 0.5 + wander * 0.6, uv.y - 0.13);
  fromSocket.x /= 0.42;
  fromSocket.y /= fromSocket.y < 0.0 ? 0.20 : 0.74;

  float reach = length(fromSocket);
  float grad = 1.0 - smoothstep(0.0, 1.0, reach);

  float sideways = 1.0 - smoothstep(0.0, 1.0, abs(fromSocket.x));

  float flame = fuel + grad * 1.14 - 1.00;
  float tongues = smoothstep(0.0, 0.30, flame);

  float socket = 1.0 - smoothstep(0.0, 1.0, length((uv - vec2(0.5, 0.11)) / vec2(0.11, 0.045)));
  socket = pow(socket, 2.0);

  float smokeRise = uTime * 0.46;
  float smoke = layeredNoise(uv * vec2(2.0, 1.0) - vec2(0.0, smokeRise));
  float smokeHigh = smoothstep(0.28, 0.70, up) * (1.0 - smoothstep(0.74, 1.0, up)) * grad;

  float heat = tongues * (0.30 + grad * 0.46) + socket * 0.26;
  heat += smoke * 0.22 * smokeHigh * sideways;

  heat = pow(clamp(heat, 0.0, 1.0), 1.30) * uHeat;

  vec3 shade = heatToColour(heat);

  float seen = smoothstep(0.0, 0.26, heat);

  gl_FragColor = vec4(shade * seen * 0.92, 1.0);
}
