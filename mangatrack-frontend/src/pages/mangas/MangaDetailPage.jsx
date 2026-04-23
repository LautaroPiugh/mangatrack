import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import mangaApi from '../../api/mangaApi.js'
import reviewApi from '../../api/reviewApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import ReviewCard from '../../components/review/ReviewCard.jsx'
import RatingStars from '../../components/review/RatingStars.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
import { getInitials } from '../../utils/formatters.js'

const buildSearchParams = (status) => {
  const params = new URLSearchParams()

  if (status) {
    params.set('status', status)
  }

  return params
}

function MangaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated, user } = useAuth()
  const { notify } = useFeedback()
  const [manga, setManga] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingReviewId, setDeletingReviewId] = useState('')
  const [isDeletingManga, setIsDeletingManga] = useState(false)

  useEffect(() => {
    const loadManga = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [mangaResponse, reviewsResponse] = await Promise.all([
          mangaApi.getById(id),
          mangaApi.getReviews(id, {
            status: searchParams.get('status') || undefined,
          }),
        ])

        setManga(mangaResponse.data)
        setReviewSummary(mangaResponse.data.reviewSummary || reviewsResponse.data.reviewSummary || {
          averageRating: 0,
          totalReviews: 0,
        })
        setReviews(reviewsResponse.data.reviews || [])
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar el detalle del manga.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadManga()
  }, [id, searchParams])

  const handleDeleteManga = async () => {
    if (!window.confirm('Esta accion eliminara el manga y sus reviews asociadas.')) {
      return
    }

    try {
      setIsDeletingManga(true)
      await mangaApi.remove(id)
      notify({
        variant: 'success',
        title: 'Manga eliminado',
        message: 'El manga y sus reviews asociadas fueron eliminados.',
      })
      navigate('/mangas')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo eliminar el manga.'))
    } finally {
      setIsDeletingManga(false)
    }
  }

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Deseas eliminar esta review?')) {
      return
    }

    try {
      setDeletingReviewId(review._id)
      await reviewApi.remove(review._id)
      setReviews((current) => current.filter((item) => item._id !== review._id))
      setReviewSummary((current) => ({
        ...current,
        totalReviews: Math.max((current.totalReviews || 1) - 1, 0),
      }))
      notify({
        variant: 'success',
        title: 'Review eliminada',
        message: 'La reseña fue eliminada correctamente.',
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo eliminar la review.'))
    } finally {
      setDeletingReviewId('')
    }
  }

  if (isLoading) {
    return <Loader label="Cargando manga..." />
  }

  if (!manga) {
    return <Alert variant="error">{error || 'No se encontro el manga solicitado.'}</Alert>
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow={manga.genre}
        title={manga.title}
        description={manga.description}
        actions={
          <div className="cluster">
            {isAuthenticated ? (
              <>
                <Link to={`/reviews/new?manga=${manga._id}`} className="button button-primary">
                  Escribir review
                </Link>
                <Link to={`/mangas/${manga._id}/edit`} className="button button-secondary">
                  Editar manga
                </Link>
                <button
                  type="button"
                  className="button button-danger"
                  onClick={handleDeleteManga}
                  disabled={isDeletingManga}
                >
                  {isDeletingManga ? 'Eliminando...' : 'Eliminar manga'}
                </button>
              </>
            ) : (
              <Link to="/login" className="button button-primary">
                Inicia sesion para participar
              </Link>
            )}
          </div>
        }
      />

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="detail-hero">
        <div className="detail-cover-shell">
          {manga.coverImage ? (
            <img src={manga.coverImage} alt={`Portada de ${manga.title}`} className="detail-cover-image" />
          ) : (
            <div className="detail-cover-fallback">{getInitials(manga.title)}</div>
          )}
        </div>

        <div className="detail-side">
          <article className="detail-card">
            <span className="detail-label">Autor</span>
            <strong>{manga.author}</strong>
          </article>
          <article className="detail-card">
            <span className="detail-label">Genero</span>
            <span className="detail-genre-pill">{manga.genre}</span>
            <strong>{manga.genre}</strong>
          </article>
          <article className="detail-card">
            <span className="detail-label">Promedio</span>
            <RatingStars rating={Math.round(reviewSummary.averageRating || 0)} />
            <strong>{reviewSummary.averageRating || 0}/5</strong>
          </article>
          <article className="detail-card">
            <span className="detail-label">Total de reviews</span>
            <strong>{reviewSummary.totalReviews || 0}</strong>
          </article>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Resenas</span>
            <h2>Comunidad lectora</h2>
          </div>

          <div className="cluster">
            <button
              type="button"
              className={`button button-ghost ${!searchParams.get('status') ? 'button-selected' : ''}`}
              onClick={() => setSearchParams(buildSearchParams(''))}
            >
              Todas
            </button>
            <button
              type="button"
              className={`button button-ghost ${searchParams.get('status') === 'reading' ? 'button-selected' : ''}`}
              onClick={() => setSearchParams(buildSearchParams('reading'))}
            >
              Reading
            </button>
            <button
              type="button"
              className={`button button-ghost ${searchParams.get('status') === 'completed' ? 'button-selected' : ''}`}
              onClick={() => setSearchParams(buildSearchParams('completed'))}
            >
              Completed
            </button>
            <button
              type="button"
              className={`button button-ghost ${searchParams.get('status') === 'planned' ? 'button-selected' : ''}`}
              onClick={() => setSearchParams(buildSearchParams('planned'))}
            >
              Planned
            </button>
          </div>
        </div>

        {reviews.length > 0 ? (
          <div className="stack-md">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?._id}
                onDelete={handleDeleteReview}
                deletingId={deletingReviewId}
                showManga={false}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Este manga aun no tiene reviews"
            description="Cuando los usuarios publiquen reseñas, apareceran aqui con su puntuacion y estado de lectura."
            action={isAuthenticated ? (
              <Link to={`/reviews/new?manga=${manga._id}`} className="button button-primary">
                Crear la primera review
              </Link>
            ) : null}
          />
        )}
      </section>
    </div>
  )
}

export default MangaDetailPage
