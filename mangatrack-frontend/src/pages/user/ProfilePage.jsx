import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import UserAvatar from '../../components/user/UserAvatar.jsx'
import useI18n from '../../hooks/useI18n.js'
import userService from '../../services/userService.js'
import { formatLongDate } from '../../utils/date.js'

function ProfilePage() {
  const { t } = useI18n()
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
    { label: t('profile.reviews'), value: stats.reviewsCount || 0, icon: '★', color: 'orange' },
    { label: t('profile.favorites'), value: stats.favoritesCount || 0, icon: '♥', color: 'green' },
    { label: t('profile.watchlist'), value: stats.watchlistCount || 0, icon: '◷', color: 'blue' },
    { label: t('profile.averageRating'), value: Number(stats.averageRatingGiven || 0).toFixed(1), icon: '☆', color: 'purple' },
  ]

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>{t('profile.title')}</h1>
          <p>{t('profile.subtitle')}</p>
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
            <h2>{t('profile.loadErrorTitle')}</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && profile ? (
          <section className="profile-shell">
            <article className="profile-overview-card">
              <div className="profile-overview-head">
                <div className="profile-avatar">
                  <UserAvatar user={profile} size={96} />
                </div>

                <div className="profile-overview-copy">
                  <div className="profile-overview-title">
                    <h2>{profile.displayName || profile.name}</h2>
                    <p>@{profile.username}</p>
                  </div>

                  <div className="profile-meta">
                    <span>{profile.email}</span>
                    {profile.role === 'admin' ? <span className="profile-badge">Admin</span> : null}
                    <span>{t('common.memberSince', { date: formatLongDate(profile.createdAt) })}</span>
                  </div>

                  {profile.bio ? <p className="public-profile-bio compact">{profile.bio}</p> : null}

                  <div className="profile-inline-actions">
                    <Link className="filter-pill" to="/settings/profile">{t('profile.editProfile')}</Link>
                    <Link className="primary-action" to={`/users/${profile.username}`}>{t('profile.publicView')}</Link>
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
                  <h2>{t('profile.topGenres')}</h2>
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
