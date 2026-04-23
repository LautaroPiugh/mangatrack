function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark">00</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export default EmptyState
