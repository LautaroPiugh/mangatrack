import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import reviewApi from '../../api/reviewApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import ReviewCard from '../../components/review/ReviewCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'

const buildSearchParams = (filters) => {
  const nextSearchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      nextSearchParams.set(key, String(value))
    }
  })

  return nextSearchParams
}

function ReviewsPage() {
  const { isAuthenticated, user } = useAuth()
  const { notify } = useFeedback()
  const [searchParams, setSearchParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingReviewId, setDeletingReviewId] = useState('')

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await reviewApi.list({
          status: searchParams.get('status') || undefined,
          page: searchParams.get('page') || 1,
        })

        setReviews(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar el listado de reviews.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [searchParams])

  const handlePageChange = (page) => {
    setSearchParams(buildSearchParams({
      status: searchParams.get('status') || '',
      page,
    }))
  }

  const handleStatusChange = (status) => {
    setSearchParams(buildSearchParams({
      status,
      page: 1,
    }))
  }

  const handleDelete = async (review) => {
    if (!window.confirm('Deseas eliminar esta review?')) {
      return
    }

    try {
      setDeletingReviewId(review._id)
      await reviewApi.remove(review._id)
      setReviews((current) => current.filter((item) => item._id !== review._id))
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

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Comunidad"
        title="Listado de reviews"
        description="Consulta las reseñas publicadas por los usuarios y filtralas por estado de lectura."
        actions={isAuthenticated ? (
          <Link to="/reviews/new" className="button button-primary">
            Nueva review
          </Link>
        ) : null}
      />

      <section className="panel">
        <div className="cluster">
          <button
            type="button"
            className={`button button-ghost ${!searchParams.get('status') ? 'button-selected' : ''}`}
            onClick={() => handleStatusChange('')}
          >
            Todas
          </button>
          <button
            type="button"
            className={`button button-ghost ${searchParams.get('status') === 'reading' ? 'button-selected' : ''}`}
            onClick={() => handleStatusChange('reading')}
          >
            Reading
          </button>
          <button
            type="button"
            className={`button button-ghost ${searchParams.get('status') === 'completed' ? 'button-selected' : ''}`}
            onClick={() => handleStatusChange('completed')}
          >
            Completed
          </button>
          <button
            type="button"
            className={`button button-ghost ${searchParams.get('status') === 'planned' ? 'button-selected' : ''}`}
            onClick={() => handleStatusChange('planned')}
          >
            Planned
          </button>
        </div>
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <Loader label="Cargando reviews..." />
      ) : reviews.length > 0 ? (
        <>
          <div className="stack-md">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={user?._id}
                onDelete={handleDelete}
                deletingId={deletingReviewId}
              />
            ))}
          </div>

          <Pagination meta={meta} onPageChange={handlePageChange} />
        </>
      ) : (
        <EmptyState
          title="No se encontraron reviews"
          description="Todavia no hay reseñas para este filtro. Puedes cambiar el estado o crear una nueva."
          action={isAuthenticated ? (
            <Link to="/reviews/new" className="button button-primary">
              Crear review
            </Link>
          ) : null}
        />
      )}
    </div>
  )
}

export default ReviewsPage
