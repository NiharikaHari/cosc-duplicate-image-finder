# Duplicate Image Finder

Upload multiple images and find exact or near-duplicate images entirely client-side, no backend or uploads involved.

- Computes three independent perceptual hashes for every image directly in the browser via Canvas:
  - **dHash (bidirectional difference hash)** - a 9x9 grayscale grid compared both column-by-column and row-by-row into a 144-bit fingerprint. Sensitive to local structure/edges.
  - **pHash (DCT-based perceptual hash)** - a 32x32 grayscale grid run through a 2D DCT, keeping the top-left 8x8 low-frequency block (63 bits). Robust to resizing, recompression, and brightness/contrast shifts that shift dHash's bits.
  - **aHash (average hash)** - an 8x8 grid thresholded against its own mean brightness (64 bits). Cheap extra signal, useful for near-solid-color images.
- Each image is additionally hashed in all **8 rotation/mirror orientations** (0/90/180/270° x normal/horizontally-flipped - the full dihedral group D4), so rotated or mirrored duplicates are found without needing an exact pixel orientation match.
- Compares every pair of images by **Hamming distance** on each hash type, converts each to a similarity percentage, combines them into one weighted score (dHash 50%, pHash 35%, aHash 15%), and takes the **best score across orientations** - a pair only scores highly if multiple, independent hashing techniques agree, in whichever relative rotation/mirror state best aligns them.
- Groups similar images into duplicate sets using connected components (union-find) over the pairwise combined-similarity graph at the current threshold.
- An adjustable **similarity threshold slider** (70-100%) lets you tune how strict the grouping is - moving the slider instantly re-groups already-computed similarities, no re-hashing needed.

## How it works

Each uploaded image is decoded once via `createImageBitmap`, then redrawn onto an offscreen canvas for each of the 8 D4 orientations (rotated/mirrored via `ctx.rotate`/`ctx.scale`, see [src/utils/orientations.js](src/utils/orientations.js)). For every orientation, three differently-sized hashes are computed on that canvas, letting the browser do the resizing:
- [src/utils/dHash.js](src/utils/dHash.js) - 9x9 grid, grayscale pixels compared to their right and bottom neighbors (144 bits).
- [src/utils/pHash.js](src/utils/pHash.js) - 32x32 grid, grayscale pixels transformed by a hand-rolled separable 2D DCT-II, keeping the low-frequency 8x8 block minus the DC term (63 bits).
- [src/utils/aHash.js](src/utils/aHash.js) - 8x8 grid, grayscale pixels thresholded against the grid's mean brightness (64 bits).

For each pair of images, all three hashes are compared bit-by-bit via XOR + popcount to get a Hamming distance, converted to a similarity percentage, and combined into one weighted score per orientation pairing - the best (highest) score across orientations wins ([src/utils/grouping.js](src/utils/grouping.js), using the generic distance/percentage helpers in [src/utils/hamming.js](src/utils/hamming.js)). Only one image in a pair needs to vary its orientation, since rotating both by the same amount wouldn't change their relative alignment - so each pairwise comparison checks 8 orientation combinations, not 64. All pairwise combined similarities are computed once per upload batch; a union-find groups images whose combined similarity meets the current threshold into duplicate sets, recomputed cheaply whenever the slider moves.

## Scope

This tool detects **near-duplicates**: the same underlying image, possibly resized, recompressed, cropped, rotated, and/or mirrored. It does **not** detect different photos of the same physical object or scene taken from a different camera angle - that's a different problem (object/scene recognition across viewpoints), which requires local keypoint matching (e.g. SIFT/ORB) or learned embeddings rather than whole-image hashing. dHash/pHash/aHash are all designed to recognize the same pixel content under global transforms; a different viewpoint produces genuinely different pixel content (framing, perspective, lighting, background), which no whole-image hash - no matter how it's combined or made rotation-invariant - can bridge.

## Setup

```
npm install
npm run dev
```

Then open the printed local URL, drag in several images (or click "Choose files"), and adjust the threshold slider to control grouping sensitivity.

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.
