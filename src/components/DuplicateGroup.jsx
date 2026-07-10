import ImageThumb from './ImageThumb.jsx'

export default function DuplicateGroup({ group, items }) {
  const [referenceIdx, ...restIdx] = group.members

  return (
    <div className="card">
      <h3 className="card-title">{group.members.length} similar images</h3>
      <div className="thumb-row">
        <ImageThumb item={items[referenceIdx]} badge="reference" />
        {restIdx.map((idx, i) => (
          <ImageThumb
            key={items[idx].id}
            item={items[idx]}
            badge={`${Math.round(group.similarities[i + 1])}% match`}
          />
        ))}
      </div>
    </div>
  )
}
