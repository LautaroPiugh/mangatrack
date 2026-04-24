import { useEffect, useState } from 'react'

import userService from '../../services/userService.js'

const formatMemberSince = (value) => {
  if (!value) {
    return 'Fecha no disponible'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

const getUserInitial = (profile) => (
  profile?.username?.trim()?.slice(0, 1)?.toUpperCase()
  || profile?.name?.trim()?.slice(0, 1)?.toUpperCase()
  || 'M'
)

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')

      try {
        const nextProfile = await userService.getMyProfile()

        if (!isMounted) {
          return
        }

        setProfile(nextProfile)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudo cargar tu perfil.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = profile?.stats || {
    reviewsCount: 0,
    favoritesCount: 0,
    watchlistCount: 0,
    averageRatingGiven: 0,
    topGenres: [],
  }

  const statCards = [
    { label: 'Reseñas', value: stats.reviewsCount || 0, icon: '★', color: 'orange' },
    { label: 'Favoritos', value: stats.favoritesCount || 0, icon: '♥', color: 'green' },
    { label: 'Pendientes', value: stats.watchlistCount || 0, icon: '◷', color: 'blue' },
    { label: 'Promedio dado', value: Number(stats.averageRatingGiven || 0).toFixed(1), icon: '☆', color: 'purple' },
  ]

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>Mi perfil</h1>
          <p>Tu espacio personal con actividad, biblioteca y estadísticas de lectura.</p>
        </div>
      </section>

      <div className="figma-content">
        {isLoading ? (
          <section className="profile-shell">
            <div className="profile-overview-card">
              <div className="profile-overview-head">
                <div className="profile-avatar profile-avatar-skeleton skeleton-block" />
                <div className="profile-overview-copy">
                  <div className="skeleton-block skeleton-title" />
                  <div className="skeleton-block skeleton-line" />
                </div>
              </div>
            </div>
            <div className="stats-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={`profile-stat-skeleton-${index}`} className="stat-card">
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-title" />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!isLoading && error ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>No se pudo cargar tu perfil</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && profile ? (
          <section className="profile-shell">
            <article className="profile-overview-card">
              <div className="profile-overview-head">
                <div className="profile-avatar">{getUserInitial(profile)}</div>

                <div className="profile-overview-copy">
                  <div className="profile-overview-title">
                    <h2>{profile.name}</h2>
                    <p>@{profile.username}</p>
                  </div>

                  <div className="profile-meta">
                    <span>{profile.email}</span>
                    {profile.role === 'admin' ? <span className="profile-badge">Admin</span> : null}
                    <span>Miembro desde {formatMemberSince(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            </article>

            <section className="stats-grid">
              {statCards.map((stat) => (
                <article key={stat.label} className={`stat-card stat-card-${stat.color}`}>
                  <span className="stat-icon">{stat.icon}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.label}</p>
                </article>
              ))}
            </section>

            {stats.topGenres?.length ? (
              <section className="figma-section">
                <div className="section-title">
                  <span>#</span>
                  <h2>Géneros más reseñados</h2>
                </div>

                <div className="profile-genre-list">
                  {stats.topGenres.map((item) => (
                    <div key={item.genre} className="profile-genre-pill">
                      <strong>{item.genre}</strong>
                      <span>{item.count} reseñas</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}

export default ProfilePage
