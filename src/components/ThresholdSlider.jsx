export default function ThresholdSlider({ value, onChange }) {
  return (
    <div className="threshold">
      <label htmlFor="threshold-range" className="threshold-label">
        Similarity threshold
      </label>
      <input
        id="threshold-range"
        type="range"
        min="60"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="threshold-value">{value}%</span>
    </div>
  )
}
