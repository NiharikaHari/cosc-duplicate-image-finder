import { computeDHash } from './dHash.js'
import { computePHash } from './pHash.js'
import { computeAHash } from './aHash.js'

/**
 * The dihedral group D4: every "flat" 2D orientation an image can appear in
 * - 4 rotations x 2 mirror states. Index 0 is always the untouched identity
 * orientation.
 */
const ORIENTATIONS = [
  { rotate: 0, flip: false },
  { rotate: 90, flip: false },
  { rotate: 180, flip: false },
  { rotate: 270, flip: false },
  { rotate: 0, flip: true },
  { rotate: 90, flip: true },
  { rotate: 180, flip: true },
  { rotate: 270, flip: true },
]

function drawOriented(bitmap, rotate, flip) {
  const swapDims = rotate === 90 || rotate === 270
  const width = swapDims ? bitmap.height : bitmap.width
  const height = swapDims ? bitmap.width : bitmap.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  if (flip) ctx.scale(-1, 1)
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)

  return canvas
}

/**
 * Computes dHash/pHash/aHash for all 8 D4 orientations of an image file, so
 * rotated and/or mirrored duplicates can be found by searching across
 * orientations during pairwise comparison instead of requiring an exact
 * pixel orientation match.
 */
export async function computeOrientedHashSets(file) {
  const bitmap = await createImageBitmap(file)

  const hashSets = []
  for (const { rotate, flip } of ORIENTATIONS) {
    const canvas = drawOriented(bitmap, rotate, flip)
    const [dHash, pHash, aHash] = await Promise.all([
      computeDHash(canvas),
      computePHash(canvas),
      computeAHash(canvas),
    ])
    hashSets.push({ dHash, pHash, aHash })
  }

  bitmap.close?.()
  return hashSets
}
