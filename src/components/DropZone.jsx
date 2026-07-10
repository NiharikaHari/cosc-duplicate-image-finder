import { useRef, useState } from 'react'

const FORMATS = ['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'AVIF']

export default function DropZone({ onFilesSelected }) {
  const inputRef = useRef(null)
  const [isActive, setIsActive] = useState(false)

  function handleDragOver(event) {
    event.preventDefault()
    setIsActive(true)
  }

  function handleDragLeave() {
    setIsActive(false)
  }

  function handleDrop(event) {
    event.preventDefault()
    setIsActive(false)
    const files = Array.from(event.dataTransfer.files || [])
    if (files.length) onFilesSelected(files)
  }

  function handleInputChange(event) {
    const files = Array.from(event.target.files || [])
    if (files.length) onFilesSelected(files)
    event.target.value = ''
  }

  return (
    <div
      className={`dropzone${isActive ? ' dropzone--active' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="dropzone-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 18a4.5 4.5 0 0 1-1.44-8.76A5.5 5.5 0 0 1 16.5 8h.25A4.25 4.25 0 0 1 17 16.5" />
          <path d="M12 12v9M9 15l3-3 3 3" />
        </svg>
      </span>
      <p className="dropzone-text">Drag and drop images here, or</p>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Upload Images
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        hidden
      />
      <div className="dropzone-formats">
        {FORMATS.map((format) => (
          <span className="format-chip" key={format}>
            {format}
          </span>
        ))}
      </div>
      <p className="dropzone-caption">Compared in your browser - nothing uploaded</p>
    </div>
  )
}
