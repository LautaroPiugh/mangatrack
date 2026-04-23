function StatCard({ label, value, description, accent = 'amber' }) {
  return (
    <article className={`metric-card metric-card-${accent}`}>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      {description ? <p>{description}</p> : null}
    </article>
  )
}

export default StatCard
