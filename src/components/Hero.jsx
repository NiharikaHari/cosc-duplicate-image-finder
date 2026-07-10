export default function Hero() {
  return (
    <section className="hero">
      <span className="hero-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="13" height="13" rx="2" />
          <path d="M8 21h10a2 2 0 0 0 2-2V9" />
        </svg>
      </span>
      <h1 className="hero-title">Duplicate Image Finder</h1>
      <p className="hero-subtitle">
        Upload images to find duplicates and near-duplicates using perceptual hashing.
        Detects copies even after resizing, cropping, rotating, or mirroring.
      </p>
    </section>
  )
}
