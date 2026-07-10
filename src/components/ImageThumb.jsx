export default function ImageThumb({ item, badge }) {
  return (
    <div className="thumb">
      <img className="thumb-img" src={item.objectUrl} alt={item.file.name} />
      {badge != null && <span className="thumb-badge">{badge}</span>}
      <p className="thumb-name" title={item.file.name}>
        {item.file.name}
      </p>
    </div>
  )
}
