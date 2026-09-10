import type * as Three from 'three'
import type { RaiderClass } from '../types/raider'
import { champions3d } from './paths'

const everyClass: RaiderClass[] = ['warrior', 'knight', 'fighter']
const heStands = 2.35
const heSitsAt = -0.16
const turnsSlowly = 0.11
const followsPointerBy = 0.26
const eases = 0.06
const decodersLiveAt = '/draco/'

export interface PlinthStage {
  show(who: RaiderClass): void
  stop(): void
}

export function carveThePlinth(
  holder: HTMLElement,
  startsAs: RaiderClass,
  whenReady: () => void
): PlinthStage {
  let stopped = false
  let letGo: (() => void) | null = null
  let showing = startsAs
  let putOnStage: ((who: RaiderClass) => void) | null = null

  void (async () => {
    let three: typeof Three
    let loader: import('three/examples/jsm/loaders/GLTFLoader.js').GLTFLoader
    let rooms: typeof import('three/examples/jsm/environments/RoomEnvironment.js')
    let composers: typeof import('three/examples/jsm/postprocessing/EffectComposer.js')
    let renders: typeof import('three/examples/jsm/postprocessing/RenderPass.js')
    let blooms: typeof import('three/examples/jsm/postprocessing/UnrealBloomPass.js')
    let outputs: typeof import('three/examples/jsm/postprocessing/OutputPass.js')

    try {
      const [main, gltf, draco, room, composer, render, bloom, output] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js'),
        import('three/examples/jsm/environments/RoomEnvironment.js'),
        import('three/examples/jsm/postprocessing/EffectComposer.js'),
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('three/examples/jsm/postprocessing/OutputPass.js')
      ])

      three = main
      rooms = room
      composers = composer
      renders = render
      blooms = bloom
      outputs = output

      const pulling = new draco.DRACOLoader()
      pulling.setDecoderPath(decodersLiveAt)

      loader = new gltf.GLTFLoader()
      loader.setDRACOLoader(pulling)
    } catch {
      whenReady()
      return
    }

    if (stopped) {
      whenReady()
      return
    }

    const canvas = document.createElement('canvas')
    canvas.className = 'plinth__carved'
    canvas.setAttribute('aria-hidden', 'true')

    let painter: Three.WebGLRenderer

    try {
      painter = new three.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      whenReady()
      return
    }

    painter.setClearColor(0x000000, 0)
    painter.toneMapping = three.ACESFilmicToneMapping
    painter.toneMappingExposure = 1.05

    const stage = new three.Scene()
    const eye = new three.PerspectiveCamera(30, 1, 0.1, 100)
    eye.position.set(0, 0.1, 6.4)

    const grinder = new three.PMREMGenerator(painter)
    stage.environment = grinder.fromScene(new rooms.RoomEnvironment(), 0.05).texture
    stage.environmentIntensity = 0.34

    const dim = new three.AmbientLight(0x1a0206, 2)

    const fromBelow = new three.SpotLight(0xff6a55, 22, 20, 0.95, 0.8)
    fromBelow.position.set(0, -2.4, 4)
    fromBelow.target.position.set(0, 0.2, 0)

    const cheek = new three.SpotLight(0xb44e4c, 12, 18, 0.9, 0.85)
    cheek.position.set(2.8, 0.6, 3.4)
    cheek.target.position.set(0, 0, 0)

    const behind = new three.PointLight(0x600110, 16, 22)
    behind.position.set(0, 1.2, -3.6)

    const brazier = new three.PointLight(0xffa031, 10, 16)
    brazier.position.set(-2.9, -0.4, 1.4)

    stage.add(dim, fromBelow, fromBelow.target, cheek, cheek.target, behind, brazier)

    function bring(where: string): Promise<Three.Group> {
      return new Promise((settled, refused) => {
        loader.load(where, (came) => settled(came.scene), undefined, refused)
      })
    }

    function settle(what: Three.Object3D): void {
      const box = new three.Box3().setFromObject(what)
      const size = box.getSize(new three.Vector3())
      const middle = box.getCenter(new three.Vector3())
      const to = heStands / Math.max(size.y, 0.0001)

      what.scale.setScalar(to)
      what.position.set(-middle.x * to, heSitsAt - middle.y * to, -middle.z * to)
    }

    const standing = new Map<RaiderClass, Three.Group>()

    try {
      const brought = await Promise.all(everyClass.map((who) => bring(champions3d[who])))

      if (stopped) {
        painter.dispose()
        grinder.dispose()
        whenReady()
        return
      }

      everyClass.forEach((who, at) => {
        const figure = brought[at]

        if (!figure) {
          return
        }

        settle(figure)
        figure.visible = who === showing
        stage.add(figure)
        standing.set(who, figure)
      })
    } catch {
      painter.dispose()
      grinder.dispose()
      whenReady()
      return
    }

    holder.append(canvas)
    whenReady()

    putOnStage = (who: RaiderClass): void => {
      showing = who
      standing.forEach((figure, name) => {
        figure.visible = name === who
      })
    }

    let wantX = 0
    let atX = 0

    function noticePointer(event: PointerEvent): void {
      const box = holder.getBoundingClientRect()
      wantX = ((event.clientX - box.left) / box.width - 0.5) * 2
    }

    function fit(): void {
      const wide = holder.clientWidth || 1
      const tall = holder.clientHeight || 1

      painter.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      painter.setSize(wide, tall, false)
      eye.aspect = wide / tall
      eye.updateProjectionMatrix()
      weave.setSize(wide, tall)
      glowing.resolution.set(wide, tall)
    }

    const weave = new composers.EffectComposer(painter)
    weave.addPass(new renders.RenderPass(stage, eye))

    const glowing = new blooms.UnrealBloomPass(new three.Vector2(1, 1), 0.34, 0.5, 0.86)
    weave.addPass(glowing)
    weave.addPass(new outputs.OutputPass())

    fit()

    const watching = new ResizeObserver(fit)
    watching.observe(holder)
    window.addEventListener('pointermove', noticePointer, { passive: true })

    const stillness = window.matchMedia('(prefers-reduced-motion: reduce)')
    let beat = 0

    function turn(now: number): void {
      if (stopped) {
        return
      }

      atX += (wantX - atX) * eases

      const drifting = stillness.matches ? 0 : now / 1000
      const here = standing.get(showing)

      if (here) {
        here.rotation.y = Math.sin(drifting * turnsSlowly) * 0.24 + atX * followsPointerBy
      }

      brazier.intensity = 10 + Math.sin(drifting * 3.1) * 2.4

      weave.render()
      beat = window.requestAnimationFrame(turn)
    }

    beat = window.requestAnimationFrame(turn)

    letGo = (): void => {
      window.cancelAnimationFrame(beat)
      watching.disconnect()
      window.removeEventListener('pointermove', noticePointer)

      standing.forEach((figure) => {
        figure.traverse((piece) => {
          const mesh = piece as Three.Mesh
          mesh.geometry?.dispose()
          const skin = mesh.material as Three.Material | Three.Material[] | undefined
          if (Array.isArray(skin)) {
            skin.forEach((one) => one.dispose())
          } else {
            skin?.dispose()
          }
        })
      })

      weave.dispose()
      grinder.dispose()
      painter.dispose()
      canvas.remove()
    }
  })()

  return {
    show(who: RaiderClass): void {
      showing = who
      putOnStage?.(who)
    },

    stop(): void {
      stopped = true
      letGo?.()
    }
  }
}
