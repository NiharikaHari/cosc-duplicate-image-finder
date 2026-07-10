/** Number of differing bits between two dHash values. */
export function hammingDistance(a, b) {
  let diff = a ^ b
  let count = 0
  while (diff > 0n) {
    count += Number(diff & 1n)
    diff >>= 1n
  }
  return count
}

/** Converts a Hamming distance into a similarity percentage, given the hash's bit length. */
export function similarityPercent(distance, bitLength) {
  return (1 - distance / bitLength) * 100
}
