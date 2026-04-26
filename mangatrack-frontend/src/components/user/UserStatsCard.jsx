function UserStatsCard({ label, value, icon, accent = 'green' }) {
  return (
    <article className={`stat-card stat-card-${accent} user-stat-card`}>
      <span className="stat-icon">{icon}</span>
      <strong>{value}</strong>
      <p>{label}</p>
    </article>
  )
}

export default UserStatsCard
