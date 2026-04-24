import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import ReviewCard from '../../components/review/ReviewCard.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useUserLibrary from '../../hooks/useUserLibrary.js'
import mangaService from '../../services/mangaService.js'
import reviewService from '../../services/reviewService.js'

const initialReviewForm = {
  rating: 0,
  content: '',
}

const statusLabels = {
  ongoing: 'En publicación',
  completed: 'Finalizado',
  hiatus: 'En pausa',
  cancelled: 'Cancelado',
}

const getReviewFormFromManga = (manga) => ({
  rating: manga?.userReview?.rating || 0,
  content: manga?.userReview?.content || '',
})

function MangaDetailPage() {
  const { slug } = useParams()
  const { notify } = useFeedback()
  const {
    isFavorite,
    isInWatchlist,
    addFavorite,
    removeFavorite,
    addToWatchlist,
    removeFromWatchlist,
    isLoading: isLibraryLoading,
  } = useUserLibrary()
  const [manga, setManga] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsMeta, setReviewsMeta] = useState(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsSort, setReviewsSort] = useState('recent')
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewsLoading, setIsReviewsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [reviewForm, setReviewForm] = useState(initialReviewForm)
  const [reviewError, setReviewError] = useState('')
  const [isSavingReview, setIsSavingReview] = useState(false)
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false)
  const loadedSlugRef = useRef('')
  const isReviewFormOpenRef = useRef(false)

  useEffect(() => {
    isReviewFormOpenRef.current = isReviewFormOpen
  }, [isReviewFormOpen])

  useEffect(() => {
    let isMounted = true
    const isHardLoad = loadedSlugRef.current !== slug

    const loadMangaDetail = async () => {
      if (isHardLoad) {
        setIsLoading(true)
      } else {
        setIsReviewsLoading(true)
      }

      setError('')

      try {
        const detail = await mangaService.getManga(slug)
        const reviewsResponse = await mangaService.getMangaReviews(detail._id, {
          page: reviewsPage,
          limit: 6,
          sort: reviewsSort,
        })

        if (!isMounted) {
          return
        }

        setManga(detail)
        loadedSlugRef.current = detail.slug || slug
        setReviews(reviewsResponse.items || [])
        setReviewsMeta(reviewsResponse.meta)

        if (isHardLoad || !isReviewFormOpenRef.current) {
          setReviewForm(getReviewFormFromManga(detail))
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudo cargar el manga.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsReviewsLoading(false)
        }
      }
    }

    loadMangaDetail()

    return () => {
      isMounted = false
    }
  }, [reviewsPage, reviewsSort, slug])

  const mangaId = manga?._id || manga?.id || null
  const favoriteActive = mangaId
    ? (isLibraryLoading ? Boolean(manga?.isFavorite) : isFavorite(mangaId))
    : Boolean(manga?.isFavorite)
  const watchlistActive = mangaId
    ? (isLibraryLoading ? Boolean(manga?.isInWatchlist) : isInWatchlist(mangaId))
    : Boolean(manga?.isInWatchlist)
  const averageRating = manga?.averageRating ?? manga?.reviewSummary?.averageRating ?? 0
  const ratingsCount = manga?.ratingsCount ?? manga?.reviewSummary?.totalReviews ?? 0
  const synopsis = manga?.synopsis || 'Todavía no hay sinopsis cargada para este manga.'
  const synopsisNeedsToggle = synopsis.length > 280
  const visibleSynopsis = synopsisNeedsToggle && !isSynopsisExpanded
    ? `${synopsis.slice(0, 280).trim()}...`
    : synopsis
  const userReview = manga?.userReview || null

  const handleFavorite = async () => {
    if (!mangaId || isFavoriteLoading || isLibraryLoading) {
      return
    }

    setIsFavoriteLoading(true)

    try {
      if (favoriteActive) {
        await removeFavorite(mangaId)
      } else {
        await addFavorite(mangaId)
      }
    } catch (actionError) {
      notify({
        variant: 'error',
        title: 'No se pudo actualizar favoritos',
        message: actionError.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleWatchlist = async () => {
    if (!mangaId || isWatchlistLoading || isLibraryLoading) {
      return
    }

    setIsWatchlistLoading(true)

    try {
      if (watchlistActive) {
        await removeFromWatchlist(mangaId)
      } else {
        await addToWatchlist(mangaId)
      }
    } catch (actionError) {
      notify({
        variant: 'error',
        title: 'No se pudo actualizar pendientes',
        message: actionError.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsWatchlistLoading(false)
    }
  }

  const handleReviewSubmit = async (event) => {
    event.preventDefault()

    if (!mangaId || !reviewForm.rating) {
      return
    }

    setIsSavingReview(true)
    setReviewError('')

    try {
      if (userReview?._id || userReview?.id) {
        await reviewService.updateReview(userReview._id || userReview.id, {
          rating: Number(reviewForm.rating),
          content: reviewForm.content,
        })
      } else {
        await reviewService.createOrUpdateReview({
          mangaId,
          rating: Number(reviewForm.rating),
          content: reviewForm.content,
        })
      }

      const [nextManga, nextReviews] = await Promise.all([
        mangaService.getManga(slug),
        mangaService.getMangaReviews(mangaId, {
          page: 1,
          limit: 6,
          sort: reviewsSort,
        }),
      ])

      setManga(nextManga)
      setReviews(nextReviews.items || [])
      setReviewsMeta(nextReviews.meta)
      setReviewsPage(1)
      setReviewForm(getReviewFormFromManga(nextManga))
      setIsReviewFormOpen(false)

      notify({
        variant: 'success',
        title: userReview ? 'Reseña actualizada' : 'Reseña creada',
        message: 'La reseña se guardó correctamente.',
      })
    } catch (submitError) {
      setReviewError(submitError.message || 'No se pudo guardar la reseña.')
    } finally {
      setIsSavingReview(false)
    }
  }

  if (isLoading) {
    return (
      <div className="figma-page">
        <div className="figma-content">
          <section className="manga-detail-skeleton">
            <div className="manga-detail-skeleton-poster skeleton-block" />
            <div className="manga-detail-skeleton-copy">
              <div className="skeleton-block skeleton-title" />
              <div className="skeleton-block skeleton-line" />
              <div className="skeleton-block skeleton-line skeleton-line-wide" />
              <div className="skeleton-pill-row">
                <span className="skeleton-block skeleton-pill" />
                <span className="skeleton-block skeleton-pill" />
                <span className="skeleton-block skeleton-pill" />
              </div>
              <div className="skeleton-button-row">
                <span className="skeleton-block skeleton-button" />
                <span className="skeleton-block skeleton-button" />
                <span className="skeleton-block skeleton-button skeleton-button-wide" />
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (error || !manga) {
    return (
      <div className="figma-page">
        <div className="figma-content">
          <section className="empty-state not-found-state">
            <span className="empty-state-icon">!</span>
            <h2>No se pudo cargar el manga</h2>
            <p>{error || 'El manga solicitado no está disponible.'}</p>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="figma-page">
      <div className="figma-content">
        <section className="manga-detail-hero">
          <div className="manga-detail-poster-shell">
            <ImageWithFallback
              src={manga.coverUrl}
              alt={`Portada de ${manga.title}`}
              className="manga-detail-poster"
              fallbackClassName="manga-detail-poster"
            />
          </div>

          <div className="manga-detail-copy">
            <div className="manga-detail-head">
              <h1>{manga.title}</h1>
              <p>{manga.author || manga.artist || 'Autor no disponible'}</p>
            </div>

            <div className="manga-detail-rating">
              <div className="figma-review-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= Math.round(averageRating) ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </div>
              <strong>{averageRating ? averageRating.toFixed(1) : '0.0'}</strong>
              <span>{Number(ratingsCount).toLocaleString('es-AR')} valoraciones</span>
            </div>

            <div className="manga-detail-meta">
              <span>{statusLabels[manga.status] || manga.status || 'Sin estado'}</span>
              <span>{manga.chapters ? `${manga.chapters} capítulos` : 'Capítulos no disponibles'}</span>
            </div>

            {manga.genres?.length ? (
              <div className="manga-detail-genres">
                {manga.genres.map((genre) => (
                  <span key={genre} className="filter-pill">{genre}</span>
                ))}
              </div>
            ) : null}

            <div className="manga-detail-actions">
              <button
                type="button"
                className={favoriteActive ? 'primary-action' : 'filter-pill'}
                onClick={handleFavorite}
                disabled={isFavoriteLoading || isLibraryLoading}
              >
                {isFavoriteLoading ? 'Actualizando...' : favoriteActive ? 'En favoritos' : 'Agregar a favoritos'}
              </button>

              <button
                type="button"
                className={watchlistActive ? 'primary-action manga-detail-action-secondary' : 'filter-pill'}
                onClick={handleWatchlist}
                disabled={isWatchlistLoading || isLibraryLoading}
              >
                {isWatchlistLoading ? 'Actualizando...' : watchlistActive ? 'En pendientes' : 'Agregar a pendientes'}
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={() => setIsReviewFormOpen((current) => !current)}
              >
                {userReview ? 'Editar reseña' : 'Escribir reseña'}
              </button>
            </div>
          </div>
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>✎</span>
            <h2>Sinopsis</h2>
          </div>

          <div className="manga-detail-synopsis">
            <p>{visibleSynopsis}</p>
            {synopsisNeedsToggle ? (
              <button
                type="button"
                className="manga-detail-link"
                onClick={() => setIsSynopsisExpanded((current) => !current)}
              >
                {isSynopsisExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            ) : null}
          </div>
        </section>

        {userReview ? (
          <section className="figma-section">
            <div className="section-title">
              <span>★</span>
              <h2>Tu reseña</h2>
            </div>

            <ReviewCard
              review={userReview}
              actions={(
                <button
                  type="button"
                  className="review-inline-action"
                  onClick={() => setIsReviewFormOpen(true)}
                >
                  Editar
                </button>
              )}
            />
          </section>
        ) : null}

        {isReviewFormOpen ? (
          <section className="review-editor-panel">
            <div className="section-title">
              <span>★</span>
              <h2>{userReview ? 'Editar reseña' : 'Escribir reseña'}</h2>
            </div>

            <form className="review-editor-form" onSubmit={handleReviewSubmit}>
              <div className="review-rating-field review-editor-form-wide">
                <span>Rating</span>
                <div className="review-rating-picker" aria-label="Seleccionar rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={star <= Number(reviewForm.rating) ? 'figma-star figma-star-active' : 'figma-star'}
                      onClick={() => setReviewForm((current) => ({ ...current, rating: star }))}
                      aria-label={`${star} estrellas`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label className="review-editor-form-wide">
                <span>Contenido</span>
                <textarea
                  name="content"
                  value={reviewForm.content}
                  onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))}
                  rows="5"
                  maxLength="1000"
                  placeholder="Escribí una reseña breve sobre este manga..."
                />
              </label>

              <div className="review-editor-actions">
                <button type="submit" className="primary-action" disabled={isSavingReview || !reviewForm.rating}>
                  {isSavingReview ? 'Guardando...' : 'Guardar reseña'}
                </button>
              </div>
            </form>

            {reviewError ? <p className="auth-feedback auth-feedback-error">{reviewError}</p> : null}
          </section>
        ) : null}

        <section className="figma-section">
          <div className="section-title">
            <span>✦</span>
            <h2>Reseñas del manga</h2>
          </div>

          <div className="manga-detail-review-toolbar">
            <div className="filter-row">
              <button
                type="button"
                className={reviewsSort === 'recent' ? 'filter-pill filter-pill-active' : 'filter-pill'}
                onClick={() => {
                  setReviewsSort('recent')
                  setReviewsPage(1)
                }}
              >
                Más recientes
              </button>
              <button
                type="button"
                className={reviewsSort === 'rating' ? 'filter-pill filter-pill-active' : 'filter-pill'}
                onClick={() => {
                  setReviewsSort('rating')
                  setReviewsPage(1)
                }}
              >
                Mejor puntuadas
              </button>
            </div>
            {isReviewsLoading ? <span className="manga-detail-inline-copy">Actualizando reseñas...</span> : null}
          </div>

          {reviews.length ? (
            <>
              <div className="review-list review-list-wide">
                {reviews.map((review) => (
                  <ReviewCard key={review._id || review.id} review={review} />
                ))}
              </div>

              {reviewsMeta?.totalPages > 1 ? (
                <div className="pagination-row">
                  <button
                    type="button"
                    className="filter-pill"
                    onClick={() => setReviewsPage((current) => Math.max(current - 1, 1))}
                    disabled={reviewsPage <= 1 || isReviewsLoading}
                  >
                    Anterior
                  </button>
                  <span className="pagination-copy">
                    Página {reviewsMeta.page} de {reviewsMeta.totalPages}
                  </span>
                  <button
                    type="button"
                    className="filter-pill"
                    onClick={() => setReviewsPage((current) => Math.min(current + 1, reviewsMeta.totalPages))}
                    disabled={reviewsPage >= reviewsMeta.totalPages || isReviewsLoading}
                  >
                    Siguiente
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">★</span>
              <h2>Aún no hay reseñas públicas</h2>
              <p>Podés ser la primera persona en dejar una opinión sobre este manga.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default MangaDetailPage
