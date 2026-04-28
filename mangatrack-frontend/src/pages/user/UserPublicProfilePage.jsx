import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import ActivityFeedList from '../../components/activity/ActivityFeedList.jsx'
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import UserListsSection from '../../components/user/UserListsSection.jsx'
import UserAvatar from '../../components/user/UserAvatar.jsx'
import UserReviewsSection from '../../components/user/UserReviewsSection.jsx'
import UserStatsCard from '../../components/user/UserStatsCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import profileService from '../../services/profileService.js'
import { formatLongDate } from '../../utils/date.js'

const getProfileName = (profile) => (
  profile?.displayName
  || profile?.name
  || profile?.username
  || 'Usuario'
)

function UserPublicProfilePage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { notify } = useFeedback()
  const { t } = useI18n()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')

      try {
        const nextProfile = await profileService.getPublicProfile(username)

        if (!isMounted) {
          return
        }

        setProfile(nextProfile)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudo cargar el perfil público.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
  }, [username])

  const statCards = useMemo(() => {
    const stats = profile?.stats || {}

    return [
      { label: t('publicProfile.favorites'), value: stats.favoritesCount || 0, icon: '♥', accent: 'green' },
      { label: t('publicProfile.watchlist'), value: stats.watchlistCount || 0, icon: '◷', accent: 'blue' },
      { label: t('publicProfile.reviews'), value: stats.reviewsCount || 0, icon: '★', accent: 'orange' },
      { label: t('publicProfile.averageRating'), value: Number(stats.averageRatingGiven || 0).toFixed(1), icon: '☆', accent: 'purple' },
    ]
  }, [profile, t])

  const handleToggleFollow = async () => {
    if (!profile || profile.isCurrentUser) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setIsFollowLoading(true)

    try {
      const result = profile.isFollowing
        ? await profileService.unfollowUser(profile.id)
        : await profileService.followUser(profile.id)

      setProfile((current) => (
        current
          ? {
              ...current,
              followersCount: result.followersCount,
              followingCount: result.followingCount,
              isFollowing: result.isFollowing,
            }
          : current
      ))

      notify({
        variant: 'success',
        title: profile.isFollowing ? t('publicProfile.followUpdatedTitle') : t('publicProfile.followingNowTitle'),
        message: profile.isFollowing
          ? t('publicProfile.unfollowedMessage', { username: profile.username })
          : t('publicProfile.followedMessage', { username: profile.username }),
      })
    } catch (actionError) {
      notify({
        variant: 'error',
        title: t('publicProfile.followErrorTitle'),
        message: actionError.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="figma-page public-profile-page">
        <div className="figma-content public-profile-content">
          <div className="public-profile-stack">
            <section className="public-profile-hero public-profile-hero-loading profile-section">
              <div className="public-profile-avatar skeleton-block" />
              <div className="public-profile-copy">
                <div className="skeleton-block skeleton-title" />
                <div className="skeleton-block skeleton-line" />
                <div className="skeleton-block skeleton-line skeleton-line-wide" />
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="figma-page">
        <div className="figma-content">
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>{t('publicProfile.loadErrorTitle')}</h2>
            <p>{error || 'El usuario solicitado no está disponible.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="figma-page public-profile-page">
      <div className="figma-content public-profile-content">
        <div className="public-profile-stack">
          <section className="public-profile-hero profile-section">
            <div className="public-profile-avatar">
              <UserAvatar user={profile} size={96} />
            </div>

            <div className="public-profile-copy">
              <div className="public-profile-headline">
                <div>
                  <span className="external-browser-kicker">{t('publicProfile.kicker')}</span>
                  <h1>{getProfileName(profile)}</h1>
                  <p>@{profile.username}</p>
                </div>

                <div className="public-profile-actions">
                  {profile.isCurrentUser ? (
                    <>
                      <Link to="/settings/profile" className="filter-pill">{t('publicProfile.editProfile')}</Link>
                      <Link to="/lists" className="primary-action">{t('publicProfile.myLists')}</Link>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={profile.isFollowing ? 'filter-pill' : 'primary-action'}
                      onClick={handleToggleFollow}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading
                        ? t('publicProfile.updating')
                        : profile.isFollowing
                          ? t('publicProfile.following')
                          : t('publicProfile.follow')}
                    </button>
                  )}
                </div>
              </div>

              <p className="public-profile-bio">
                {profile.bio || t('publicProfile.noBio')}
              </p>

              <div className="public-profile-meta">
                <span>{t('common.memberSince', { date: formatLongDate(profile.createdAt) })}</span>
                <span>{t('common.followers', { count: profile.followersCount || 0 })}</span>
                <span>{t('common.following', { count: profile.followingCount || 0 })}</span>
              </div>
            </div>
          </section>

          <section className="stats-grid profile-section public-profile-stats">
            {statCards.map((stat) => (
              <UserStatsCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                accent={stat.accent}
              />
            ))}
          </section>

          {profile.stats?.topGenres?.length ? (
            <section className="figma-section profile-section public-profile-genres">
              <div className="section-title">
                <span>#</span>
                <h2>{t('publicProfile.topGenres')}</h2>
              </div>

              <div className="profile-genre-list">
                {profile.stats.topGenres.map((genre) => (
                  <div key={genre.genre} className="profile-genre-pill">
                    <strong>{genre.genre}</strong>
                    <span>{t('publicProfile.reviewCount', { count: genre.count })}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="figma-section profile-section public-profile-favorites">
            <div className="section-title">
              <span>♥</span>
              <h2>{t('publicProfile.favoritesTitle')}</h2>
            </div>

            {profile.favorites?.length ? (
              <div className="favorite-showcase-grid public-profile-favorite-grid">
                {profile.favorites.map((manga) => (
                  <Link key={manga._id || manga.id || manga.slug} className="favorite-showcase-card" to={`/mangas/${manga.slug || manga._id || manga.id}`}>
                    <ImageWithFallback
                      src={manga.coverUrl || manga.coverImage}
                      alt={manga.title}
                      className="favorite-showcase-image"
                      fallbackClassName="favorite-showcase-image"
                    />
                    <div className="favorite-showcase-copy">
                      <strong>{manga.title}</strong>
                      <span>{manga.author || manga.artist || manga.genres?.[0] || t('common.manga')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state-icon">♥</span>
                <h2>{t('publicProfile.favoritesEmptyTitle')}</h2>
                <p>{t('publicProfile.favoritesEmptyMessage')}</p>
              </div>
            )}
          </section>

          <UserReviewsSection
            title={t('publicProfile.recentReviews')}
            reviews={profile.recentReviews || []}
            emptyTitle={t('publicProfile.reviewsEmptyTitle')}
            emptyMessage={t('publicProfile.reviewsEmptyMessage')}
            sectionClassName="profile-section public-profile-reviews"
            listClassName="public-profile-review-list"
          />

          <UserListsSection
            title={t('publicProfile.listsTitle')}
            username={profile.username}
            lists={profile.lists || []}
            emptyTitle={t('publicProfile.listsEmptyTitle')}
            emptyMessage={t('publicProfile.listsEmptyMessage')}
            sectionClassName="profile-section public-profile-lists"
            gridClassName="public-profile-list-grid"
            cardVariant="compact"
          />

          <ActivityFeedList
            title={t('publicProfile.recentActivity')}
            activities={profile.activity || []}
            emptyTitle={t('publicProfile.activityEmptyTitle')}
            emptyMessage={t('publicProfile.activityEmptyMessage')}
            sectionClassName="profile-section public-profile-activity"
            timelineClassName="public-profile-activity-list"
          />
        </div>
      </div>
    </div>
  )
}

export default UserPublicProfilePage
