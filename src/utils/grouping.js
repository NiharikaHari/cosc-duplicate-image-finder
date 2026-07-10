import { hammingDistance, similarityPercent } from './hamming.js'
import { HASH_BIT_LENGTH as DHASH_BIT_LENGTH } from './dHash.js'
import { PHASH_BIT_LENGTH } from './pHash.js'
import { AHASH_BIT_LENGTH } from './aHash.js'

/**
 * Relative weight of each hash type in the combined similarity score. dHash
 * gets the largest share since it's the highest-resolution hash (144 bits);
 * pHash is weighted second for its complementary robustness to
 * recompression/brightness changes; aHash is a light tie-breaking signal.
 */
const WEIGHTS = { dHash: 0.5, pHash: 0.35, aHash: 0.15 }

function combinedSimilarity(a, b) {
  const simD = similarityPercent(hammingDistance(a.dHash, b.dHash), DHASH_BIT_LENGTH)
  const simP = similarityPercent(hammingDistance(a.pHash, b.pHash), PHASH_BIT_LENGTH)
  const simA = similarityPercent(hammingDistance(a.aHash, b.aHash), AHASH_BIT_LENGTH)
  return WEIGHTS.dHash * simD + WEIGHTS.pHash * simP + WEIGHTS.aHash * simA
}

/**
 * Best similarity between two images across every relative rotation/mirror.
 * Only one side needs to vary its orientation (index 0 = identity on the
 * other side) - rotating both images by the same amount doesn't change their
 * relative alignment, so searching orientationsB against identityA already
 * covers every possible relative transform between the two.
 */
function bestOrientedSimilarity(orientationsA, orientationsB) {
  let best = -Infinity
  for (const b of orientationsB) {
    const similarity = combinedSimilarity(orientationsA[0], b)
    if (similarity > best) best = similarity
  }
  return best
}

/**
 * Computes the best combined similarity (across all rotation/mirror
 * orientations) between every pair of images once, so the threshold slider
 * can regroup instantly without re-hashing or re-comparing.
 */
export function computePairwiseSimilarities(orientationHashSets) {
  const pairs = []
  const similarityMap = new Map()
  for (let i = 0; i < orientationHashSets.length; i++) {
    for (let j = i + 1; j < orientationHashSets.length; j++) {
      const similarity = bestOrientedSimilarity(orientationHashSets[i], orientationHashSets[j])
      pairs.push({ i, j, similarity })
      similarityMap.set(`${i}-${j}`, similarity)
    }
  }
  return { pairs, similarityMap }
}

function createUnionFind(n) {
  const parent = Array.from({ length: n }, (_, i) => i)

  function find(x) {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }

  function union(a, b) {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootA] = rootB
  }

  return { find, union }
}

/**
 * Groups images into duplicate sets: any two images whose similarity meets
 * the threshold end up in the same connected component. Cheap to call on
 * every slider change since it only re-walks the already-computed pairs.
 */
export function groupByThreshold(pairs, similarityMap, n, thresholdPercent) {
  const { find, union } = createUnionFind(n)

  for (const { i, j, similarity } of pairs) {
    if (similarity >= thresholdPercent) union(i, j)
  }

  const rootToMembers = new Map()
  for (let idx = 0; idx < n; idx++) {
    const root = find(idx)
    if (!rootToMembers.has(root)) rootToMembers.set(root, [])
    rootToMembers.get(root).push(idx)
  }

  const groups = [...rootToMembers.values()].map((members) => {
    const reference = members[0]
    const similarities = members.map((idx) => {
      if (idx === reference) return 100
      const key = idx < reference ? `${idx}-${reference}` : `${reference}-${idx}`
      return similarityMap.get(key)
    })
    return { members, similarities }
  })

  groups.sort((a, b) => b.members.length - a.members.length)
  return groups
}
