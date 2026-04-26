import { useEffect, useState } from 'react'

import MangaCard from '../components/manga/MangaCard.jsx'
import ReviewCard from '../components/review/ReviewCard.jsx'
import useI18n from '../hooks/useI18n.js'
import mangaService from '../services/mangaService.js'
import reviewService from '../services/reviewService.js'
import userService from '../services/userService.js'

function HomePage() {
  const { t } = useI18n()
  const [userStats, setUserStats] = useState(null)
  const [trendingMangas, setTrendingMangas] = useState([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [trendingError, setTrendingError] = useState('')
  const [recentReviews, setRecentReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      setIsLoadingStats(true)

      try {
        const profile = await userService.getMyProfile()

        if (!isMounted) {
          return
        }

        setUserStats(profile?.stats || {})
      } catch {
        if (!isMounted) {
          return
        }
        // Error loading stats will be handled by showing 0 values
      } finally {
        if (isMounted) {
          setIsLoadingStats(false)
        }
      }
    }

    void loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadTrendingMangas = async () => {
      setIsLoadingTrending(true)
      setTrendingError('')

      try {
        const response = await mangaService.getMangas({
          limit: 6,
          sort: 'rating',
        })

        if (!isMounted) {
          return
        }

        setTrendingMangas(response.items || [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        setTrendingError(error.message || t('home.trendingErrorTitle'))
      } finally {
        if (isMounted) {
          setIsLoadingTrending(false)
        }
      }
    }

    loadTrendingMangas()

    return () => {
      isMounted = false
    }
  }, [t])

  useEffect(() => {
    let isMounted = true

    const loadRecentReviews = async () => {
      setIsLoadingReviews(true)
      setReviewsError('')

      try {
        const items = await reviewService.getRecentReviews({ limit: 4 })

        if (!isMounted) {
          return
        }

        setRecentReviews(items || [])
      } catch (error) {
        if (!isMounted) {
          return
        }

        setReviewsError(error.message || t('home.reviewsErrorTitle'))
      } finally {
        if (isMounted) {
          setIsLoadingReviews(false)
        }
      }
    }

    loadRecentReviews()

    return () => {
      isMounted = false
    }
  }, [t])

  return (
    <div className="figma-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <h1>{t('home.heroTitle')}</h1>
          <p>{t('home.heroSubtitle')}</p>
        </div>
      </section>

      <div className="figma-content">
        <section className="stats-grid">
          {isLoadingStats ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={`stat-skeleton-${idx}`} className="stat-card">
                <div className="skeleton-block skeleton-line" />
                <div className="skeleton-block skeleton-title" />
              </div>
            ))
          ) : null}
          {!isLoadingStats && userStats ? (
            <>
              <article className="stat-card stat-card-green">
                <span className="stat-icon">本</span>
                <strong>{userStats.favoritesCount || 0}</strong>
                <p>{t('home.favoritesStat')}</p>
              </article>
              <article className="stat-card stat-card-orange">
                <span className="stat-icon">★</span>
                <strong>{userStats.reviewsCount || 0}</strong>
                <p>{t('home.reviewsStat')}</p>
              </article>
              <article className="stat-card stat-card-blue">
                <span className="stat-icon">◷</span>
                <strong>{userStats.watchlistCount || 0}</strong>
                <p>{t('home.watchlistStat')}</p>
              </article>
              <article className="stat-card stat-card-purple">
                <span className="stat-icon">☆</span>
                <strong>{Number(userStats.averageRatingGiven || 0).toFixed(1)}</strong>
                <p>{t('home.averageRatingStat')}</p>
              </article>
            </>
          ) : null}
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>↗</span>
            <h2>{t('home.trendingTitle')}</h2>
          </div>
          {isLoadingTrending ? (
            <div className="empty-state">
              <span className="empty-state-icon">⌛</span>
              <h2>{t('home.trendingLoadingTitle')}</h2>
              <p>{t('home.trendingLoadingMessage')}</p>
            </div>
          ) : null}
          {!isLoadingTrending && trendingError ? (
            <div className="empty-state">
              <span className="empty-state-icon">!</span>
              <h2>{t('home.trendingErrorTitle')}</h2>
              <p>{trendingError}</p>
            </div>
          ) : null}
          {!isLoadingTrending && !trendingError && trendingMangas.length ? (
            <div className="manga-grid">
              {trendingMangas.map((manga) => (
                <MangaCard key={manga._id || manga.slug} manga={manga} />
              ))}
            </div>
          ) : null}
          {!isLoadingTrending && !trendingError && !trendingMangas.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">本</span>
              <h2>{t('home.trendingEmptyTitle')}</h2>
              <p>{t('home.trendingEmptyMessage')}</p>
            </div>
          ) : null}
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>★</span>
            <h2>{t('home.recentReviewsTitle')}</h2>
          </div>
          {isLoadingReviews ? (
            <div className="empty-state">
              <span className="empty-state-icon">⌛</span>
              <h2>{t('home.reviewsLoadingTitle')}</h2>
              <p>{t('home.reviewsLoadingMessage')}</p>
            </div>
          ) : null}
          {!isLoadingReviews && reviewsError ? (
            <div className="empty-state">
              <span className="empty-state-icon">!</span>
              <h2>{t('home.reviewsErrorTitle')}</h2>
              <p>{reviewsError}</p>
            </div>
          ) : null}
          {!isLoadingReviews && !reviewsError && recentReviews.length ? (
            <div className="review-list">
              {recentReviews.map((review) => (
                <ReviewCard key={review._id || review.id} review={review} />
              ))}
            </div>
          ) : null}
          {!isLoadingReviews && !reviewsError && !recentReviews.length ? (
            <div className="empty-state">
              <span className="empty-state-icon">★</span>
              <h2>{t('home.reviewsEmptyTitle')}</h2>
              <p>{t('home.reviewsEmptyMessage')}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default HomePage
