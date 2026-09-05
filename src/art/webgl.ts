import type { ShaderPair } from '../types/flames'

const fullScreenCorners = new Float32Array([-1, -1, 3, -1, -1, 3])

function buildShader(gl: WebGLRenderingContext, kind: number, source: string): WebGLShader {
  const shader = gl.createShader(kind)
  if (!shader) {
    throw new Error('the card would not make a shader')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const complaint = gl.getShaderInfoLog(shader) ?? 'no reason given'
    gl.deleteShader(shader)
    throw new Error(`shader would not compile: ${complaint}`)
  }

  return shader
}

export function paintFullScreen(
  canvas: HTMLCanvasElement,
  pair: ShaderPair
): { gl: WebGLRenderingContext; program: WebGLProgram } {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power'
  })

  if (!gl) {
    throw new Error('this browser will not give us webgl')
  }

  const vertex = buildShader(gl, gl.VERTEX_SHADER, pair.vertexSource)
  const fragment = buildShader(gl, gl.FRAGMENT_SHADER, pair.fragmentSource)

  const program = gl.createProgram()
  if (!program) {
    throw new Error('the card would not make a program')
  }

  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const complaint = gl.getProgramInfoLog(program) ?? 'no reason given'
    throw new Error(`shaders would not link: ${complaint}`)
  }

  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  gl.useProgram(program)

  const corners = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, corners)
  gl.bufferData(gl.ARRAY_BUFFER, fullScreenCorners, gl.STATIC_DRAW)

  const cornerSlot = gl.getAttribLocation(program, 'aCorner')
  gl.enableVertexAttribArray(cornerSlot)
  gl.vertexAttribPointer(cornerSlot, 2, gl.FLOAT, false, 0, 0)

  return { gl, program }
}
