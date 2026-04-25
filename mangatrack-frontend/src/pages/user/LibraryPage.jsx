import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import MangaCard from '../../components/manga/MangaCard.jsx'
import ReviewCard from '../../components/review/ReviewCard.jsx'
import useUserLibrary from '../../hooks/useUserLibrary.js'
import userService from '../../services/userService.js'

const libraryTabs = [
  { value: 'favorites', label: 'Favoritos' },
  { value: 'watchlist', label: 'Pendientes' },
  { value: 'reviews', label: 'Mis reseñas' },
]

const getActiveTab = (value) => (
  libraryTabs.some((item) => item.value === value) ? value : 'favorites'
)

function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    favorites,
    watchlist,
    hasLoaded,
    isLoading: isLibrarySyncLoading,
  } = useUserLibrary()
  const [library, setLibrary] = useState({
    favorites: [],
    watchlist: [],
    reviews: [],
    stats: null,
    meta: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const activeTab = getActiveTab(searchParams.get('tab'))
  const page = Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1)

  useEffect(() => {
    let isMounted = true

    const loadLibrary = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await userService.getMyLibrary(
          activeTab === 'reviews'
            ? {
                section: 'reviews',
                page,
                limit: 8,
              }
            : {
                section: activeTab,
                limit: 50,
              },
        )

        if (!isMounted) {
          return
        }

        setLibrary({
          favorites: response.favorites || [],
          watchlist: response.watchlist || [],
          reviews: response.reviews || [],
          stats: response.stats || null,
          meta: response.meta || null,
        })
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudo cargar tu biblioteca.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLibrary()

    return () => {
      isMounted = false
    }
  }, [activeTab, page])

  const resolvedStats = useMemo(() => ({
    reviewsCount: library.stats?.reviewsCount || 0,
    favoritesCount: hasLoaded ? favorites.length : library.stats?.favoritesCount || 0,
    watchlistCount: hasLoaded ? watchlist.length : library.stats?.watchlistCount || 0,
    averageRatingGiven: Number(library.stats?.averageRatingGiven || 0).toFixed(1),
  }), [favorites.length, hasLoaded, library.stats, watchlist.length])

  const favoriteItems = hasLoaded ? favorites : library.favorites
  const watchlistItems = hasLoaded ? watchlist : library.watchlist
  const reviewItems = library.reviews || []
  const activeItems = activeTab === 'favorites'
    ? favoriteItems
    : activeTab === 'watchlist'
      ? watchlistItems
      : reviewItems

  const showLoadingState = activeTab === 'reviews'
    ? isLoading && !reviewItems.length
    : ((!hasLoaded && isLibrarySyncLoading) || (isLoading && !activeItems.length))

  const updateSearch = (nextValues) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value)
      } else {
        nextSearchParams.delete(key)
      }
    })

    if (Number.parseInt(nextSearchParams.get('page') || '1', 10) <= 1) {
      nextSearchParams.delete('page')
    }

    setSearchParams(nextSearchParams)
  }

  const goToPage = (nextPage) => {
    updateSearch({ page: nextPage > 1 ? String(nextPage) : '' })
  }

  const renderEmptyState = () => {
    if (activeTab === 'favorites') {
      return (
        <div className="empty-state">
          <span className="empty-state-icon">♥</span>
          <h2>Todavía no agregaste favoritos</h2>
          <p>Guardá tus mangas preferidos para encontrarlos rápido en tu biblioteca.</p>
        </div>
      )
    }

    if (activeTab === 'watchlist') {
      return (
        <div className="empty-state">
          <span className="empty-state-icon">◷</span>
          <h2>No tenés pendientes</h2>
          <p>Agregá mangas a pendientes para leerlos después.</p>
        </div>
      )
    }

    return (
      <div className="empty-state">
        <span className="empty-state-icon">★</span>
        <h2>Aún no escribiste reseñas</h2>
        <p>Cuando publiques una review, va a aparecer acá junto al manga asociado.</p>
      </div>
    )
  }

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>Mi biblioteca</h1>
          <p>Reuní tus favoritos, pendientes y reseñas en un solo lugar.</p>
        </div>

        <div className="list-header-actions">
          <div className="filter-row">
            {libraryTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={activeTab === tab.value ? 'filter-pill filter-pill-active' : 'filter-pill'}
                onClick={() => updateSearch({ tab: tab.value, page: '' })}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="figma-content">
        <section className="library-summary-strip">
          <article className="library-summary-card">
            <strong>{resolvedStats.favoritesCount}</strong>
            <span>Favoritos</span>
          </article>
          <article className="library-summary-card">
            <strong>{resolvedStats.watchlistCount}</strong>
            <span>Pendientes</span>
          </article>
          <article className="library-summary-card">
            <strong>{resolvedStats.reviewsCount}</strong>
            <span>Reseñas</span>
          </article>
          <article className="library-summary-card">
            <strong>{resolvedStats.averageRatingGiven}</strong>
            <span>Promedio dado</span>
          </article>
        </section>

        {error && activeItems.length ? <p className="auth-feedback auth-feedback-error">{error}</p> : null}

        {showLoadingState ? (
          <section className={activeTab === 'reviews' ? 'review-list' : 'manga-grid manga-grid-wide'}>
            {Array.from({ length: activeTab === 'reviews' ? 3 : 6 }).map((_, index) => (
              <div key={`library-skeleton-${activeTab}-${index}`} className="library-skeleton-card">
                <div className="skeleton-block library-skeleton-media" />
                <div className="skeleton-block skeleton-line-wide" />
                <div className="skeleton-block skeleton-line" />
              </div>
            ))}
          </section>
        ) : null}

        {!showLoadingState && error && !activeItems.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>No se pudo cargar tu biblioteca</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!showLoadingState && !error && !activeItems.length ? renderEmptyState() : null}

        {!showLoadingState && activeTab === 'favorites' && favoriteItems.length ? (
          <div className="manga-grid manga-grid-wide">
            {favoriteItems.map((manga) => (
              <MangaCard key={manga._id || manga.id || manga.slug} manga={manga} />
            ))}
          </div>
        ) : null}

        {!showLoadingState && activeTab === 'watchlist' && watchlistItems.length ? (
          <div className="manga-grid manga-grid-wide">
            {watchlistItems.map((manga) => (
              <MangaCard key={manga._id || manga.id || manga.slug} manga={manga} />
            ))}
          </div>
        ) : null}

        {!showLoadingState && activeTab === 'reviews' && reviewItems.length ? (
          <>
            <div className="review-list review-list-wide">
              {reviewItems.map((review) => (
                <ReviewCard
                  key={review._id || review.id}
                  review={review}
                  actions={review.manga?.slug ? (
                    <Link className="review-inline-link" to={`/mangas/${review.manga.slug}`}>
                      Ver manga
                    </Link>
                  ) : null}
                />
              ))}
            </div>

            {library.meta?.totalPages > 1 ? (
              <div className="pagination-row">
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                >
                  Anterior
                </button>
                <span className="pagination-copy">
                  Página {library.meta.page} de {library.meta.totalPages}
                </span>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= library.meta.totalPages}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}

export default LibraryPage
