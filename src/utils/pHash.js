const IMAGE_SIZE = 32
const HASH_SIZE = 8

/** 8x8 low-frequency DCT block, excluding the DC term. */
export const PHASH_BIT_LENGTH = HASH_SIZE * HASH_SIZE - 1

function dct1d(vector) {
  const n = vector.length
  const out = new Float64Array(n)
  for (let k = 0; k < n; k++) {
    let sum = 0
    for (let i = 0; i < n; i++) {
      sum += vector[i] * Math.cos((Math.PI / n) * (i + 0.5) * k)
    }
    out[k] = sum * (k === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n))
  }
  return out
}

/**
 * Computes a DCT-based perceptual hash (pHash) for an image source.
 *
 * The image is squashed to 32x32 grayscale, then a separable 2D DCT-II is
 * applied (1D DCT over rows, then over columns). The top-left 8x8 block of
 * low-frequency coefficients (excluding the DC term) is thresholded against
 * its median to produce a 63-bit fingerprint. Unlike dHash's local pixel
 * gradients, pHash captures the image's overall frequency content, so it
 * stays stable across resizing, recompression, and minor brightness/contrast
 * changes that would shift dHash's bits.
 *
 * @param {File|Blob|HTMLCanvasElement} source - accepts anything
 * `createImageBitmap` understands, so orientation-transformed canvases from
 * `orientations.js` work the same as a raw uploaded file.
 */
export async function computePHash(source) {
  const bitmap = await createImageBitmap(source)

  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_SIZE
  canvas.height = IMAGE_SIZE
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, IMAGE_SIZE, IMAGE_SIZE)
  bitmap.close?.()

  const { data } = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE)
  const gray = new Float64Array(IMAGE_SIZE * IMAGE_SIZE)
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  }

  const rowDct = new Float64Array(IMAGE_SIZE * IMAGE_SIZE)
  for (let row = 0; row < IMAGE_SIZE; row++) {
    const rowSlice = gray.subarray(row * IMAGE_SIZE, (row + 1) * IMAGE_SIZE)
    rowDct.set(dct1d(rowSlice), row * IMAGE_SIZE)
  }

  const colDct = new Float64Array(IMAGE_SIZE * IMAGE_SIZE)
  const colBuffer = new Float64Array(IMAGE_SIZE)
  for (let col = 0; col < IMAGE_SIZE; col++) {
    for (let row = 0; row < IMAGE_SIZE; row++) colBuffer[row] = rowDct[row * IMAGE_SIZE + col]
    const transformed = dct1d(colBuffer)
    for (let row = 0; row < IMAGE_SIZE; row++) colDct[row * IMAGE_SIZE + col] = transformed[row]
  }

  const lowFreq = []
  for (let row = 0; row < HASH_SIZE; row++) {
    for (let col = 0; col < HASH_SIZE; col++) {
      if (row === 0 && col === 0) continue
      lowFreq.push(colDct[row * IMAGE_SIZE + col])
    }
  }

  const sorted = [...lowFreq].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]

  let hash = 0n
  for (const value of lowFreq) {
    hash = (hash << 1n) | (value > median ? 1n : 0n)
  }

  return hash
}
