const handles = new Map<string, string>()

const names = [
  'Ashfoot', 'Bonewright', 'Cinderhale', 'Draymoor', 'Emberlock',
  'Fenmark', 'Grimsdale', 'Hollowen', 'Ironmoor', 'Jarrowen',
  'Kelvar', 'Lowmire', 'Marrowend', 'Northgate', 'Oakenshaw'
]

export function handleFor(address: string): string {
  const held = handles.get(address.toLowerCase())
  if (held) {
    return held
  }

  const seat = handles.size
  const name = names[seat % names.length] ?? 'Stranger'
  const run = Math.floor(seat / names.length)
  const handle = run === 0 ? name : `${name} the ${run + 1}`

  handles.set(address.toLowerCase(), handle)
  return handle
}

export function whoIsThis(handle: string): string | null {
  for (const [address, held] of handles) {
    if (held === handle) {
      return address
    }
  }
  return null
}

const looksLikeAnAddress = /0x[0-9a-fA-F]{40}/g
const looksLikeAHash = /0x[0-9a-fA-F]{64}/g
const looksLikeAKey = /\b[0-9a-fA-F]{64}\b/g

export function scrubbed(text: string): string {
  return text
    .replace(looksLikeAHash, '[hash]')
    .replace(looksLikeAnAddress, '[address]')
    .replace(looksLikeAKey, '[secret]')
}

export function nothingSecretIn(payload: unknown): boolean {
  const asText = JSON.stringify(payload)
  return (
    !looksLikeAnAddress.test(asText) &&
    !looksLikeAHash.test(asText) &&
    !/PRIVATE_KEY|API_KEY|secret/i.test(asText)
  )
}
