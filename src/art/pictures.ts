const alreadyLoaded = new Map<string, Promise<HTMLImageElement>>()

export function loadPicture(path: string): Promise<HTMLImageElement> {
  const waiting = alreadyLoaded.get(path)
  if (waiting) {
    return waiting
  }

  const attempt = new Promise<HTMLImageElement>((succeed, fail) => {
    const picture = new Image()
    picture.decoding = 'async'
    picture.addEventListener('load', () => succeed(picture))
    picture.addEventListener('error', () => fail(new Error(`missing art: ${path}`)))
    picture.src = path
  })

  alreadyLoaded.set(path, attempt)
  return attempt
}

export function loadEveryPicture(paths: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(paths.map(loadPicture))
}

export async function loadWhatYouCan(paths: string[]): Promise<void> {
  await Promise.allSettled(paths.map(loadPicture))
}
