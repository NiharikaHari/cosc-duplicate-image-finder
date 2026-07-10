import DuplicateGroup from './DuplicateGroup.jsx'
import ImageThumb from './ImageThumb.jsx'

export default function ResultsPanel({ allItems, items, groups }) {
  const hashingCount = allItems.filter((item) => item.status === 'hashing').length
  const errorItems = allItems.filter((item) => item.status === 'error')

  if (allItems.length === 0) {
    return <p className="status-note">Upload some images to get started.</p>
  }

  const duplicateGroups = groups.filter((group) => group.members.length > 1)
  const singleGroups = groups.filter((group) => group.members.length === 1)

  return (
    <div className="results">
      {hashingCount > 0 && (
        <p className="status-note">Hashing {hashingCount} image(s)...</p>
      )}
      {errorItems.length > 0 && (
        <p className="status-note status-note--error">
          Couldn't read {errorItems.length} file(s) as images - skipped.
        </p>
      )}

      {duplicateGroups.length > 0 && (
        <section>
          <h2>Duplicate groups</h2>
          <div className="group-list">
            {duplicateGroups.map((group) => (
              <DuplicateGroup key={group.members[0]} group={group} items={items} />
            ))}
          </div>
        </section>
      )}

      {singleGroups.length > 0 && (
        <section>
          <h2>No duplicates found</h2>
          <div className="thumb-row">
            {singleGroups.map((group) => (
              <ImageThumb key={items[group.members[0]].id} item={items[group.members[0]]} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
