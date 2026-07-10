import { useRef, useState } from 'react'

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
      <p>Drag and drop images here</p>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Choose files
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        hidden
      />
    </div>
  )
}
