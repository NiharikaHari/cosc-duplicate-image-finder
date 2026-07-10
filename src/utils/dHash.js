const HASH_WIDTH = 9
const HASH_HEIGHT = 9

/** Horizontal comparisons (9 rows x 8 col-pairs) + vertical (8 row-pairs x 9 cols). */
export const HASH_BIT_LENGTH = HASH_HEIGHT * (HASH_WIDTH - 1) + (HASH_HEIGHT - 1) * HASH_WIDTH

/**
 * Computes a bidirectional difference hash (dHash) for an image source.
 *
 * The image is squashed down to a 9x9 grayscale grid (ignoring aspect ratio).
 * Each pixel is compared to both its right neighbor and its neighbor below:
 * 1 if the earlier pixel is at least as bright, 0 otherwise. Horizontal
 * comparisons (9 rows x 8 = 72 bits) and vertical comparisons (8 rows x 9 =
 * 72 bits) are packed together into one 144-bit BigInt so Hamming distance
 * reduces to a simple XOR + popcount, and both gradient directions count
 * toward similarity instead of just horizontal structure.
 *
 * @param {File|Blob|HTMLCanvasElement} source - accepts anything
 * `createImageBitmap` understands, so orientation-transformed canvases from
 * `orientations.js` work the same as a raw uploaded file.
 */
export async function computeDHash(source) {
  const bitmap = await createImageBitmap(source)

  const canvas = document.createElement('canvas')
  canvas.width = HASH_WIDTH
  canvas.height = HASH_HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, HASH_WIDTH, HASH_HEIGHT)
  bitmap.close?.()

  const { data } = ctx.getImageData(0, 0, HASH_WIDTH, HASH_HEIGHT)
  const gray = new Float64Array(HASH_WIDTH * HASH_HEIGHT)
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }

  let hash = 0n
  for (let row = 0; row < HASH_HEIGHT; row++) {
    for (let col = 0; col < HASH_WIDTH - 1; col++) {
      const left = gray[row * HASH_WIDTH + col]
      const right = gray[row * HASH_WIDTH + col + 1]
      hash = (hash << 1n) | (left >= right ? 1n : 0n)
    }
  }
  for (let row = 0; row < HASH_HEIGHT - 1; row++) {
    for (let col = 0; col < HASH_WIDTH; col++) {
      const top = gray[row * HASH_WIDTH + col]
      const bottom = gray[(row + 1) * HASH_WIDTH + col]
      hash = (hash << 1n) | (top >= bottom ? 1n : 0n)
    }
  }

  return hash
}
