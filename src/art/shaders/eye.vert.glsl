varying vec3 vFacing;
varying vec3 vSpot;

void main() {
  vFacing = normalize(normalMatrix * normal);
  vSpot = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
