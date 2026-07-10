import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import DropZone from './components/DropZone.jsx'
import ThresholdSlider from './components/ThresholdSlider.jsx'
import ResultsPanel from './components/ResultsPanel.jsx'
import { computeOrientedHashSets } from './utils/orientations.js'
import { computePairwiseSimilarities, groupByThreshold } from './utils/grouping.js'
import './App.css'

export default function App() {
  const [items, setItems] = useState([])
  const [threshold, setThreshold] = useState(90)

  const itemsRef = useRef(items)
  itemsRef.current = items

  // Revoke all thumbnail object URLs on unmount to avoid leaking memory.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.objectUrl)
    }
  }, [])

  function handleFilesSelected(files) {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    const newItems = imageFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      objectUrl: URL.createObjectURL(file),
      status: 'hashing',
      orientationHashes: null,
    }))
    if (newItems.length === 0) return
    setItems((prev) => [...prev, ...newItems])

    for (const item of newItems) {
      computeOrientedHashSets(item.file)
        .then((orientationHashes) => {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id ? { ...i, status: 'ready', orientationHashes } : i,
            ),
          )
        })
        .catch(() => {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'error' } : i)),
          )
        })
    }
  }

  const readyItems = useMemo(() => items.filter((item) => item.status === 'ready'), [items])

  const { pairs, similarityMap } = useMemo(
    () => computePairwiseSimilarities(readyItems.map((item) => item.orientationHashes)),
    [readyItems],
  )

  const groups = useMemo(
    () => groupByThreshold(pairs, similarityMap, readyItems.length, threshold),
    [pairs, similarityMap, readyItems.length, threshold],
  )

  return (
    <div className="app-page">
      <Header />
      <main className="app-main">
        <Hero />
        <div className="tool-panel">
          <DropZone onFilesSelected={handleFilesSelected} />
          {readyItems.length > 1 && (
            <ThresholdSlider value={threshold} onChange={setThreshold} />
          )}
          <ResultsPanel allItems={items} items={readyItems} groups={groups} />
        </div>
      </main>
    </div>
  )
}
