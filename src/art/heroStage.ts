import type * as Three from 'three'
import { carvedSkull, fieryLogo } from './paths'

const skullSits = { x: 0, y: 0.2, z: 0 }
const logoSits = { x: 0, y: -0.92, z: 1.1 }
const skullStands = 2.62
const logoStands = 1.0
const skullTurns = 0.16
const logoTurns = 0.09
const followsPointerBy = 0.19
const eases = 0.055
const eyesSitAt = [
  { x: -0.33, y: 0.1, z: 0.4 },
  { x: 0.33, y: 0.1, z: 0.4 }
]
const eyeBurns = 0.072
const decodersLiveAt = '/draco/'

export interface HeroStage {
  stop(): void
}

export function carveTheHero(holder: HTMLElement, whenReady: () => void): HeroStage {
  let stopped = false
  let letGo: (() => void) | null = null

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
    canvas.className = 'hero__carved'
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
    painter.toneMappingExposure = 0.95

    const stage = new three.Scene()

    const grinder = new three.PMREMGenerator(painter)
    stage.environment = grinder.fromScene(new rooms.RoomEnvironment(), 0.05).texture
    stage.environmentIntensity = 0.22
    const eye = new three.PerspectiveCamera(34, 1, 0.1, 100)
    eye.position.set(0, 0, 5.2)

    const dim = new three.AmbientLight(0x150003, 1.6)

    const fromBelow = new three.SpotLight(0xff6a55, 16, 18, 0.95, 0.75)
    fromBelow.position.set(0, -2.0, 3.8)
    fromBelow.target.position.set(0, 0.6, 0)

    const cheek = new three.SpotLight(0xb44e4c, 8, 16, 0.9, 0.8)
    cheek.position.set(2.2, -0.4, 3.4)
    cheek.target.position.set(0, 0.4, 0)

    const onTheLetters = new three.SpotLight(0xffa031, 26, 12, 1.0, 0.9)
    onTheLetters.position.set(0, -1.9, 3.0)
    onTheLetters.target.position.set(0, -0.92, 1.1)

    const behind = new three.PointLight(0x600110, 9, 20)
    behind.position.set(0, 1.4, -3.2)

    const crown = new three.PointLight(0x3c020a, 3, 14)
    crown.position.set(-1.6, 3.0, 1.4)

    stage.add(dim, fromBelow, fromBelow.target, cheek, cheek.target, onTheLetters, onTheLetters.target, behind, crown)

    function settle(what: Three.Object3D, sits: { x: number; y: number; z: number }, tall: number): void {
      const box = new three.Box3().setFromObject(what)
      const size = box.getSize(new three.Vector3())
      const middle = box.getCenter(new three.Vector3())
      const to = tall / Math.max(size.y, 0.0001)

      what.scale.setScalar(to)
      what.position.set(sits.x - middle.x * to, sits.y - middle.y * to, sits.z - middle.z * to)
    }

    function lightUpTheirFaces(what: Three.Object3D, glow: number, tint: number): void {
      what.traverse((piece) => {
        const skin = (piece as Three.Mesh).material as Three.MeshStandardMaterial | undefined

        if (!skin || !('emissive' in skin)) {
          return
        }

        skin.emissive = new three.Color(tint)
        skin.emissiveIntensity = glow
        skin.envMapIntensity = 0.7
        skin.roughness = Math.min(skin.roughness ?? 1, 0.62)
        skin.needsUpdate = true
      })
    }

    function bring(where: string): Promise<Three.Group> {
      return new Promise((settled, refused) => {
        loader.load(where, (came) => settled(came.scene), undefined, refused)
      })
    }

    let skull: Three.Group
    let logo: Three.Group
    const burning: Three.Mesh[] = []

    try {
      const [gotSkull, gotLogo] = await Promise.all([bring(carvedSkull), bring(fieryLogo)])

      if (stopped) {
        painter.dispose()
        whenReady()
        return
      }

      skull = gotSkull
      logo = gotLogo

      settle(skull, skullSits, skullStands)
      settle(logo, logoSits, logoStands)

      lightUpTheirFaces(skull, 0.18, 0x8c0a12)
      lightUpTheirFaces(logo, 0.32, 0x8a2408)

      stage.add(skull, logo)

      eyesSitAt.forEach((sits) => {
        const socket = new three.Mesh(
          new three.SphereGeometry(eyeBurns, 16, 16),
          new three.MeshBasicMaterial({ color: 0xff2a12, toneMapped: false })
        )
        socket.position.set(sits.x, sits.y, sits.z)
        stage.add(socket)
        burning.push(socket)
      })
    } catch {
      painter.dispose()
      whenReady()
      return
    }

    holder.append(canvas)
    whenReady()

    let wantX = 0
    let wantY = 0
    let atX = 0
    let atY = 0

    function noticePointer(event: PointerEvent): void {
      const box = holder.getBoundingClientRect()
      wantX = ((event.clientX - box.left) / box.width - 0.5) * 2
      wantY = ((event.clientY - box.top) / box.height - 0.5) * 2
    }

    function fit(): void {
      const wide = holder.clientWidth || 1
      const tall = Math.round(wide * 0.49)

      painter.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      painter.setSize(wide, tall, false)
      canvas.style.height = `${tall}px`
      eye.aspect = wide / tall
      eye.updateProjectionMatrix()
      weave.setSize(wide, tall)
      glowing.resolution.set(wide, tall)
    }

    const weave = new composers.EffectComposer(painter)
    weave.addPass(new renders.RenderPass(stage, eye))

    const glowing = new blooms.UnrealBloomPass(new three.Vector2(1, 1), 0.78, 0.58, 0.7)
    weave.addPass(glowing)
    weave.addPass(new outputs.OutputPass())

    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('pointermove', noticePointer, { passive: true })

    const stillness = window.matchMedia('(prefers-reduced-motion: reduce)')
    let beat = 0

    function turn(now: number): void {
      if (stopped) {
        return
      }

      atX += (wantX - atX) * eases
      atY += (wantY - atY) * eases

      const drifting = stillness.matches ? 0 : now / 1000

      skull.rotation.y = Math.sin(drifting * skullTurns) * 0.22 + atX * followsPointerBy
      skull.rotation.x = Math.sin(drifting * skullTurns * 0.7) * 0.05 + atY * 0.08

      logo.rotation.y = Math.sin(drifting * logoTurns) * 0.1 + atX * 0.08
      logo.rotation.x = atY * 0.04

      behind.intensity = 9 + Math.sin(drifting * 2.1) * 2

      const flicker = 0.86 + Math.sin(drifting * 5.4) * 0.07 + Math.sin(drifting * 11.3) * 0.04
      burning.forEach((socket) => {
        socket.scale.setScalar(flicker)
        socket.position.x = (socket.position.x < 0 ? -0.33 : 0.33) + atX * 0.02
      })

      weave.render()
      beat = window.requestAnimationFrame(turn)
    }

    beat = window.requestAnimationFrame(turn)

    letGo = (): void => {
      window.cancelAnimationFrame(beat)
      window.removeEventListener('resize', fit)
      window.removeEventListener('pointermove', noticePointer)
      weave.dispose()
      grinder.dispose()
      painter.dispose()
      canvas.remove()
    }
  })()

  return {
    stop(): void {
      stopped = true
      letGo?.()
    }
  }
}
