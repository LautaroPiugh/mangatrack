import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import AddToListModal from '../../components/manga/AddToListModal.jsx'
import ReviewCard from '../../components/review/ReviewCard.jsx'
import StarRatingDisplay from '../../components/review/StarRatingDisplay.jsx'
import StarRatingInput from '../../components/review/StarRatingInput.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import useUserLibrary from '../../hooks/useUserLibrary.js'
import mangaService from '../../services/mangaService.js'
import reviewService from '../../services/reviewService.js'

const initialReviewForm = {
  rating: 0,
  content: '',
}

const getReviewFormFromManga = (manga) => ({
  rating: manga?.userReview?.rating || 0,
  content: manga?.userReview?.content || '',
})

function MangaDetailPage() {
  const { slug } = useParams()
  const { notify } = useFeedback()
  const { language, t } = useI18n()
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
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const loadedSlugRef = useRef('')
  const isReviewFormOpenRef = useRef(false)
  const locale = language === 'en' ? 'en-US' : 'es-AR'
  const statusLabels = {
    ongoing: t('mangaStatuses.ongoing'),
    completed: t('mangaStatuses.completed'),
    hiatus: t('mangaStatuses.hiatus'),
    cancelled: t('mangaStatuses.cancelled'),
  }

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

        setError(loadError.message || t('mangaDetail.loadErrorTitle'))
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
  }, [reviewsPage, reviewsSort, slug, t])

  const mangaId = manga?._id || manga?.id || null
  const favoriteActive = mangaId
    ? (isLibraryLoading ? Boolean(manga?.isFavorite) : isFavorite(mangaId))
    : Boolean(manga?.isFavorite)
  const watchlistActive = mangaId
    ? (isLibraryLoading ? Boolean(manga?.isInWatchlist) : isInWatchlist(mangaId))
    : Boolean(manga?.isInWatchlist)
  const averageRating = manga?.averageRating ?? manga?.reviewSummary?.averageRating ?? 0
  const ratingsCount = manga?.ratingsCount ?? manga?.reviewSummary?.totalReviews ?? 0
  const synopsis = manga?.synopsis || t('mangaDetail.noSynopsis')
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
        notify({
          variant: 'info',
          title: t('notifications.favoriteRemovedTitle'),
          message: t('notifications.favoriteRemovedMessage', { title: manga.title }),
        })
      } else {
        await addFavorite(mangaId)
        notify({
          variant: 'success',
          title: t('notifications.favoriteAddedTitle'),
          message: t('notifications.favoriteAddedMessage', { title: manga.title }),
        })
      }
    } catch (actionError) {
      notify({
        variant: 'error',
        title: t('notifications.favoritesErrorTitle'),
        message: actionError.message || t('notifications.tryAgainMessage'),
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
        notify({
          variant: 'info',
          title: t('notifications.watchlistRemovedTitle'),
          message: t('notifications.watchlistRemovedMessage', { title: manga.title }),
        })
      } else {
        await addToWatchlist(mangaId)
        notify({
          variant: 'success',
          title: t('notifications.watchlistAddedTitle'),
          message: t('notifications.watchlistAddedMessage', { title: manga.title }),
        })
      }
    } catch (actionError) {
      notify({
        variant: 'error',
        title: t('notifications.watchlistErrorTitle'),
        message: actionError.message || t('notifications.tryAgainMessage'),
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
        title: userReview ? t('notifications.reviewUpdatedTitle') : t('notifications.reviewCreatedTitle'),
        message: t('notifications.reviewSavedMessage'),
      })
    } catch (submitError) {
      setReviewError(submitError.message || t('mangaDetail.saveErrorMessage'))
    } finally {
      setIsSavingReview(false)
    }
  }

  const handleListAdded = (list) => {
    setIsListModalOpen(false)
    notify({
      variant: 'success',
      title: t('notifications.listItemAddedTitle'),
      message: t('notifications.listItemAddedMessage', { manga: manga.title, list: list.title }),
    })
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
            <h2>{t('mangaDetail.loadErrorTitle')}</h2>
            <p>{error || t('mangaDetail.unavailableMessage')}</p>
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
              <p>{manga.author || manga.artist || t('mangaDetail.authorUnavailable')}</p>
            </div>

            <div className="manga-detail-rating">
              <StarRatingDisplay value={averageRating} size="md" />
              <strong>{averageRating ? averageRating.toFixed(1) : '0.0'}</strong>
              <span>{t('mangaDetail.ratingsCount', { count: Number(ratingsCount).toLocaleString(locale) })}</span>
            </div>

            <div className="manga-detail-meta">
              <span>{statusLabels[manga.status] || manga.status || t('mangaStatuses.unknown')}</span>
              <span>{manga.chapters ? t('mangaDetail.chaptersCount', { count: manga.chapters }) : t('mangaDetail.chaptersUnavailable')}</span>
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
                {isFavoriteLoading ? t('common.updating') : favoriteActive ? t('mangaDetail.inFavorites') : t('mangaDetail.addToFavorites')}
              </button>

              <button
                type="button"
                className={watchlistActive ? 'primary-action manga-detail-action-secondary' : 'filter-pill'}
                onClick={handleWatchlist}
                disabled={isWatchlistLoading || isLibraryLoading}
              >
                {isWatchlistLoading ? t('common.updating') : watchlistActive ? t('mangaDetail.inWatchlist') : t('mangaDetail.addToWatchlist')}
              </button>

              <button
                type="button"
                className="primary-action"
                onClick={() => setIsReviewFormOpen((current) => !current)}
              >
                {userReview ? t('mangaDetail.editReview') : t('mangaDetail.writeReview')}
              </button>

              <button
                type="button"
                className="filter-pill"
                onClick={() => setIsListModalOpen(true)}
              >
                {t('mangaDetail.addToList')}
              </button>
            </div>
          </div>
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>✎</span>
            <h2>{t('mangaDetail.synopsisTitle')}</h2>
          </div>

          <div className="manga-detail-synopsis">
            <p>{visibleSynopsis}</p>
            {synopsisNeedsToggle ? (
              <button
                type="button"
                className="manga-detail-link"
                onClick={() => setIsSynopsisExpanded((current) => !current)}
              >
                {isSynopsisExpanded ? t('mangaDetail.viewLess') : t('mangaDetail.viewMore')}
              </button>
            ) : null}
          </div>
        </section>

        {userReview ? (
          <section className="figma-section">
            <div className="section-title">
              <span>★</span>
              <h2>{t('mangaDetail.yourReview')}</h2>
            </div>

            <ReviewCard
              review={userReview}
              actions={(
                <button
                  type="button"
                  className="review-inline-action"
                  onClick={() => setIsReviewFormOpen(true)}
                >
                  {t('common.edit')}
                </button>
              )}
            />
          </section>
        ) : null}

        {isReviewFormOpen ? (
          <section className="review-editor-panel">
            <div className="section-title">
              <span>★</span>
              <h2>{userReview ? t('mangaDetail.editReview') : t('mangaDetail.writeReview')}</h2>
            </div>

            <form className="review-editor-form" onSubmit={handleReviewSubmit}>
              <div className="review-rating-field review-editor-form-wide">
                <span>{t('mangaDetail.ratingLabel')}</span>
                <StarRatingInput
                  value={Number(reviewForm.rating) || 0}
                  onChange={(nextRating) => setReviewForm((current) => ({ ...current, rating: nextRating }))}
                  ariaLabel={t('mangaDetail.ratingAria')}
                />
                <small className="review-rating-note">
                  {t('mangaDetail.ratingHelp')}
                </small>
              </div>

              <label className="review-editor-form-wide">
                <span>{t('mangaDetail.contentLabel')}</span>
                <textarea
                  name="content"
                  value={reviewForm.content}
                  onChange={(event) => setReviewForm((current) => ({ ...current, content: event.target.value }))}
                  rows="5"
                  maxLength="1000"
                  placeholder={t('mangaDetail.contentPlaceholder')}
                />
              </label>

              <div className="review-editor-actions">
                <button type="submit" className="primary-action" disabled={isSavingReview || !reviewForm.rating}>
                  {isSavingReview ? t('common.saving') : t('mangaDetail.submit')}
                </button>
              </div>
            </form>

            {reviewError ? <p className="auth-feedback auth-feedback-error">{reviewError}</p> : null}
          </section>
        ) : null}

        <section className="figma-section">
          <div className="section-title">
            <span>✦</span>
            <h2>{t('mangaDetail.reviewsTitle')}</h2>
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
                {t('mangaDetail.sortRecent')}
              </button>
              <button
                type="button"
                className={reviewsSort === 'rating' ? 'filter-pill filter-pill-active' : 'filter-pill'}
                onClick={() => {
                  setReviewsSort('rating')
                  setReviewsPage(1)
                }}
              >
                {t('mangaDetail.sortTop')}
              </button>
            </div>
            {isReviewsLoading ? <span className="manga-detail-inline-copy">{t('mangaDetail.reviewsUpdating')}</span> : null}
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
                    {t('common.previous')}
                  </button>
                  <span className="pagination-copy">
                    {t('common.pageOf', { current: reviewsMeta.page, total: reviewsMeta.totalPages })}
                  </span>
                  <button
                    type="button"
                    className="filter-pill"
                    onClick={() => setReviewsPage((current) => Math.min(current + 1, reviewsMeta.totalPages))}
                    disabled={reviewsPage >= reviewsMeta.totalPages || isReviewsLoading}
                  >
                    {t('common.next')}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">★</span>
              <h2>{t('mangaDetail.reviewsEmptyTitle')}</h2>
              <p>{t('mangaDetail.reviewsEmptyMessage')}</p>
            </div>
          )}
        </section>

        <AddToListModal
          isOpen={isListModalOpen}
          manga={manga}
          onClose={() => setIsListModalOpen(false)}
          onAdded={handleListAdded}
        />
      </div>
    </div>
  )
}

export default MangaDetailPage
