import { useEffect, useState } from 'react'

import ReviewCard from '../../components/review/ReviewCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
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
            title: 'No se pudieron cargar los mangas',
            message: loadError.message || 'Intentá nuevamente.',
          })
        }
      }
    }

    loadReviewOptions()

    return () => {
      isMounted = false
    }
  }, [notify])

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

        setError(loadError.message || 'No se pudieron cargar las reviews.')
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
  }, [page, viewMode])

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
        title: 'Reseña guardada',
        message: 'La review se guardó correctamente.',
      })

      const response = await reviewService.getMyReviews({ page: 1, limit: 10 })
      setReviews(response.items || [])
      setMeta(response.meta)
    } catch (submitError) {
      setFormError(submitError.message || 'No se pudo guardar la reseña.')
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
        title: 'Reseña eliminada',
        message: 'La review se eliminó correctamente.',
      })
    } catch (deleteError) {
      notify({
        variant: 'error',
        title: 'No se pudo eliminar la reseña',
        message: deleteError.message || 'Intentá nuevamente.',
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
          <h1>Reseñas</h1>
          <p>Opiniones breves de lectores para descubrir qué vale la pena seguir.</p>
          {meta?.total ? <p className="list-summary">{meta.total} reseñas encontradas</p> : null}
        </div>

        <div className="list-header-actions">
          <button type="button" className="primary-action" onClick={() => setIsCreateOpen((current) => !current)}>
            {isCreateOpen ? 'Cancelar' : '＋ Nueva reseña'}
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
              Todas
            </button>
            <button
              type="button"
              className={viewMode === 'mine' ? 'filter-pill filter-pill-active' : 'filter-pill'}
              onClick={() => {
                setViewMode('mine')
                setPage(1)
              }}
            >
              Mis reseñas
            </button>
          </div>
        </div>
      </section>

      <div className="figma-content">
        {isCreateOpen ? (
          <section className="review-editor-panel">
            <div className="section-title">
              <span>★</span>
              <h2>Nueva reseña</h2>
            </div>

            <form className="review-editor-form" onSubmit={handleCreateReview}>
              <label>
                <span>Manga</span>
                <select name="mangaId" value={reviewForm.mangaId} onChange={handleFormChange} required>
                  <option value="">Seleccionar manga</option>
                  {availableMangas.map((manga) => (
                    <option key={manga._id || manga.id || manga.slug} value={manga._id || manga.id}>
                      {manga.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="review-rating-field">
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
                  onChange={handleFormChange}
                  rows="4"
                  maxLength="1000"
                  placeholder="Escribí una opinión breve sobre este manga..."
                />
              </label>

              <div className="review-editor-actions">
                <button type="submit" className="primary-action" disabled={isSubmitting || !reviewForm.rating}>
                  {isSubmitting ? 'Guardando...' : 'Guardar reseña'}
                </button>
              </div>
            </form>

            {formError ? <p className="auth-feedback auth-feedback-error">{formError}</p> : null}
          </section>
        ) : null}

        {isLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">⌛</span>
            <h2>Cargando reseñas</h2>
            <p>Estamos consultando las reviews reales.</p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>No se pudieron cargar las reseñas</h2>
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
                      {isDeletingId === (review._id || review.id) ? 'Eliminando...' : 'Eliminar'}
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
                  Anterior
                </button>
                <span className="pagination-copy">
                  Página {meta.page} de {meta.totalPages}
                </span>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setPage((current) => Math.min(current + 1, meta.totalPages))}
                  disabled={page >= meta.totalPages}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {!isLoading && !error && !reviews.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">★</span>
            <h2>No hay reseñas para mostrar</h2>
            <p>{viewMode === 'mine' ? 'Todavía no escribiste ninguna reseña.' : 'Aún no hay reseñas públicas.'}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ReviewsPage
