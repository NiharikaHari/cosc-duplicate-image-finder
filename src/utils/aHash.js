const HASH_SIZE = 8

export const AHASH_BIT_LENGTH = HASH_SIZE * HASH_SIZE

/**
 * Computes an average hash (aHash) for an image source.
 *
 * The image is squashed to an 8x8 grayscale grid, and each pixel is
 * compared against the mean brightness of the grid: 1 if at or above the
 * mean, 0 otherwise. This is the cheapest and crudest of the three hashes,
 * but it's a useful extra signal for near-solid-color images where
 * gradient-based hashes (dHash) are noisy.
 *
 * @param {File|Blob|HTMLCanvasElement} source - accepts anything
 * `createImageBitmap` understands, so orientation-transformed canvases from
 * `orientations.js` work the same as a raw uploaded file.
 */
export async function computeAHash(source) {
  const bitmap = await createImageBitmap(source)

  const canvas = document.createElement('canvas')
  canvas.width = HASH_SIZE
  canvas.height = HASH_SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, HASH_SIZE, HASH_SIZE)
  bitmap.close?.()

  const { data } = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE)
  const gray = new Float64Array(HASH_SIZE * HASH_SIZE)
  let sum = 0
  for (let i = 0; i < gray.length; i++) {
    const value = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    gray[i] = value
    sum += value
  }
  const mean = sum / gray.length

  let hash = 0n
  for (let i = 0; i < gray.length; i++) {
    hash = (hash << 1n) | (gray[i] >= mean ? 1n : 0n)
  }

  return hash
}
