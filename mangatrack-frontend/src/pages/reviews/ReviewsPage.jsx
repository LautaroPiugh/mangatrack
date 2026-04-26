import { useEffect, useState } from 'react'

import ReviewCard from '../../components/review/ReviewCard.jsx'
import StarRatingInput from '../../components/review/StarRatingInput.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import mangaService from '../../services/mangaService.js'
import reviewService from '../../services/reviewService.js'

const initialForm = {
  mangaId: '',
  rating: 0,
  content: '',
}

function ReviewsPage() {
  const { user } = useAuth()
  const { notify } = useFeedback()
  const { t } = useI18n()
  const [viewMode, setViewMode] = useState('public')
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [availableMangas, setAvailableMangas] = useState([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState('')
  const [formError, setFormError] = useState('')
  const [reviewForm, setReviewForm] = useState(initialForm)

  useEffect(() => {
    let isMounted = true

    const loadReviewOptions = async () => {
      try {
        const response = await mangaService.getMangas({
          limit: 50,
          sort: 'title',
        })

        if (isMounted) {
          setAvailableMangas(response.items || [])
        }
      } catch (loadError) {
        if (isMounted) {
          notify({
            variant: 'error',
            title: t('reviewsPage.loadMangasErrorTitle'),
            message: loadError.message || t('reviewsPage.loadMangasErrorMessage'),
          })
        }
      }
    }

    loadReviewOptions()

    return () => {
      isMounted = false
    }
  }, [notify, t])

  useEffect(() => {
    let isMounted = true

    const loadReviews = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = viewMode === 'mine'
          ? await reviewService.getMyReviews({ page, limit: 10 })
          : await reviewService.getReviews({ page, limit: 10 })

        if (!isMounted) {
          return
        }

        setReviews(response.items || [])
        setMeta(response.meta)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || t('reviewsPage.loadErrorMessage'))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [page, t, viewMode])

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setReviewForm((current) => ({ ...current, [name]: value }))
  }

  const handleCreateReview = async (event) => {
    event.preventDefault()
    setFormError('')
    setIsSubmitting(true)

    try {
      await reviewService.createOrUpdateReview({
        mangaId: reviewForm.mangaId,
        rating: reviewForm.rating,
        content: reviewForm.content,
      })

      setReviewForm(initialForm)
      setIsCreateOpen(false)
      setViewMode('mine')
      setPage(1)
      notify({
        variant: 'success',
        title: t('notifications.reviewCreatedTitle'),
        message: t('notifications.reviewSavedMessage'),
      })

      const response = await reviewService.getMyReviews({ page: 1, limit: 10 })
      setReviews(response.items || [])
      setMeta(response.meta)
    } catch (submitError) {
      setFormError(submitError.message || t('reviewsPage.saveErrorMessage'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId) => {
    setIsDeletingId(reviewId)

    try {
      await reviewService.deleteReview(reviewId)

      const response = viewMode === 'mine'
        ? await reviewService.getMyReviews({ page, limit: 10 })
        : await reviewService.getReviews({ page, limit: 10 })

      setReviews(response.items || [])
      setMeta(response.meta)
      notify({
        variant: 'success',
        title: t('notifications.reviewDeletedTitle'),
        message: t('notifications.reviewDeletedMessage'),
      })
    } catch (deleteError) {
      notify({
        variant: 'error',
        title: t('notifications.reviewDeleteErrorTitle'),
        message: deleteError.message || t('notifications.tryAgainMessage'),
      })
    } finally {
      setIsDeletingId('')
    }
  }

  const canManageReview = (review) => {
    const reviewUserId = review.user?._id || review.user?.id
    return user?.role === 'admin' || reviewUserId === user?.id
  }

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>{t('reviewsPage.title')}</h1>
          <p>{t('reviewsPage.subtitle')}</p>
          {meta?.total ? <p className="list-summary">{t('reviewsPage.resultsCount', { count: meta.total })}</p> : null}
        </div>

        <div className="list-header-actions">
          <button type="button" className="primary-action" onClick={() => setIsCreateOpen((current) => !current)}>
            {isCreateOpen ? t('reviewsPage.closeForm') : t('reviewsPage.newReview')}
          </button>

          <div className="filter-row">
            <button
              type="button"
              className={viewMode === 'public' ? 'filter-pill filter-pill-active' : 'filter-pill'}
              onClick={() => {
                setViewMode('public')
                setPage(1)
              }}
            >
              {t('reviewsPage.publicTab')}
            </button>
            <button
              type="button"
              className={viewMode === 'mine' ? 'filter-pill filter-pill-active' : 'filter-pill'}
              onClick={() => {
                setViewMode('mine')
                setPage(1)
              }}
            >
              {t('reviewsPage.myTab')}
            </button>
          </div>
        </div>
      </section>

      <div className="figma-content">
        {isCreateOpen ? (
          <section className="review-editor-panel">
            <div className="section-title">
              <span>★</span>
              <h2>{t('reviewsPage.createTitle')}</h2>
            </div>

            <form className="review-editor-form" onSubmit={handleCreateReview}>
              <label>
                <span>{t('reviewsPage.mangaLabel')}</span>
                <select name="mangaId" value={reviewForm.mangaId} onChange={handleFormChange} required>
                  <option value="">{t('reviewsPage.selectManga')}</option>
                  {availableMangas.map((manga) => (
                    <option key={manga._id || manga.id || manga.slug} value={manga._id || manga.id}>
                      {manga.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="review-rating-field">
                <span>{t('reviewsPage.ratingLabel')}</span>
                <StarRatingInput
                  value={Number(reviewForm.rating) || 0}
                  onChange={(nextRating) => setReviewForm((current) => ({ ...current, rating: nextRating }))}
                  ariaLabel={t('reviewsPage.ratingAria')}
                />
                <small className="review-rating-note">
                  {t('reviewsPage.ratingHelp')}
                </small>
              </div>

              <label className="review-editor-form-wide">
                <span>{t('reviewsPage.contentLabel')}</span>
                <textarea
                  name="content"
                  value={reviewForm.content}
                  onChange={handleFormChange}
                  rows="4"
                  maxLength="1000"
                  placeholder={t('reviewsPage.contentPlaceholder')}
                />
              </label>

              <div className="review-editor-actions">
                <button type="submit" className="primary-action" disabled={isSubmitting || !reviewForm.rating}>
                  {isSubmitting ? t('common.saving') : t('reviewsPage.submit')}
                </button>
              </div>
            </form>

            {formError ? <p className="auth-feedback auth-feedback-error">{formError}</p> : null}
          </section>
        ) : null}

        {isLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">⌛</span>
            <h2>{t('reviewsPage.loadingTitle')}</h2>
            <p>{t('reviewsPage.loadingMessage')}</p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>{t('reviewsPage.loadErrorTitle')}</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && reviews.length ? (
          <>
            <div className="review-list review-list-wide">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id || review.id}
                  review={review}
                  actions={canManageReview(review) ? (
                    <button
                      type="button"
                      className="review-inline-action"
                      onClick={() => handleDeleteReview(review._id || review.id)}
                      disabled={isDeletingId === (review._id || review.id)}
                    >
                      {isDeletingId === (review._id || review.id) ? t('reviewsPage.deletingAction') : t('reviewsPage.deleteAction')}
                    </button>
                  ) : null}
                />
              ))}
            </div>

            {meta?.totalPages > 1 ? (
              <div className="pagination-row">
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page <= 1}
                >
                  {t('common.previous')}
                </button>
                <span className="pagination-copy">
                  {t('common.pageOf', { current: meta.page, total: meta.totalPages })}
                </span>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setPage((current) => Math.min(current + 1, meta.totalPages))}
                  disabled={page >= meta.totalPages}
                >
                  {t('common.next')}
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {!isLoading && !error && !reviews.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">★</span>
            <h2>{t('reviewsPage.emptyTitle')}</h2>
            <p>{viewMode === 'mine' ? t('reviewsPage.emptyMineMessage') : t('reviewsPage.emptyPublicMessage')}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ReviewsPage
