import type { Part } from '../types/parts'
import { burningTorch } from '../art/paths'
import { startFlipbook } from '../art/flipbook'

export async function lightTorch(): Promise<Part> {
  const torch = document.createElement('div')
  torch.className = 'torch'
  torch.setAttribute('aria-hidden', 'true')

  const fire = await startFlipbook({
    frames: burningTorch,
    framesPerSecond: 9,
    startAtRandomFrame: true
  })

  torch.append(fire.canvas)

  return {
    element: torch,
    teardown(): void {
      fire.stop()
      torch.remove()
    }
  }
}
