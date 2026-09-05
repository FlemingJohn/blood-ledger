import type { BurningBackdrop } from '../types/flames'
import { paintFullScreen } from '../art/webgl'
import vertexSource from '../art/shaders/flames.vert.glsl?raw'
import fragmentSource from '../art/shaders/flames.frag.glsl?raw'

const softenBy = 0.5
const widestWeDraw = 1100
const stillnessAsked = window.matchMedia('(prefers-reduced-motion: reduce)')

export function lightTheBackdrop(): BurningBackdrop | null {
  const canvas = document.createElement('canvas')
  canvas.className = 'backdrop'
  canvas.setAttribute('aria-hidden', 'true')

  let gl: WebGLRenderingContext
  let program: WebGLProgram

  try {
    const painted = paintFullScreen(canvas, { vertexSource, fragmentSource })
    gl = painted.gl
    program = painted.program
  } catch {
    return null
  }

  const sizeSlot = gl.getUniformLocation(program, 'uSize')
  const timeSlot = gl.getUniformLocation(program, 'uTime')

  let heartbeat = 0
  let stillRunning = true
  let startedAt = 0

  function fitToWindow(): void {
    const wide = Math.min(window.innerWidth * softenBy, widestWeDraw)
    const tall = wide * (window.innerHeight / window.innerWidth)

    canvas.width = Math.max(2, Math.round(wide))
    canvas.height = Math.max(2, Math.round(tall))

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(sizeSlot, canvas.width, canvas.height)
  }

  function draw(seconds: number): void {
    gl.uniform1f(timeSlot, seconds)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  function beat(now: number): void {
    if (!stillRunning) {
      return
    }
    if (startedAt === 0) {
      startedAt = now
    }
    draw((now - startedAt) / 1000)
    heartbeat = window.requestAnimationFrame(beat)
  }

  fitToWindow()
  draw(0)

  if (!stillnessAsked.matches) {
    heartbeat = window.requestAnimationFrame(beat)
  }

  const refit = (): void => {
    fitToWindow()
    if (stillnessAsked.matches) {
      draw(0)
    }
  }

  window.addEventListener('resize', refit)

  return {
    canvas,
    stop(): void {
      stillRunning = false
      window.removeEventListener('resize', refit)
      if (heartbeat) {
        window.cancelAnimationFrame(heartbeat)
      }
      canvas.remove()
    }
  }
}
