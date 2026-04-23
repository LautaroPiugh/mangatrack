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
import StatCard from '../../components/common/StatCard.jsx'
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

function MyReviewsPage() {
  const { user } = useAuth()
  const { notify } = useFeedback()
  const [searchParams, setSearchParams] = useSearchParams()
  const [reviews, setReviews] = useState([])
  const [meta, setMeta] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    reading: 0,
    completed: 0,
    planned: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingReviewId, setDeletingReviewId] = useState('')

  useEffect(() => {
    const loadMyReviews = async () => {
      try {
        setIsLoading(true)
        setError('')

        const currentStatus = searchParams.get('status') || undefined
        const [response, readingResponse, completedResponse, plannedResponse] = await Promise.all([
          reviewApi.getMine({
            status: currentStatus,
            page: searchParams.get('page') || 1,
          }),
          reviewApi.getMine({ status: 'reading', page: 1, limit: 1 }),
          reviewApi.getMine({ status: 'completed', page: 1, limit: 1 }),
          reviewApi.getMine({ status: 'planned', page: 1, limit: 1 }),
        ])

        setReviews(response.data)
        setMeta(response.meta)
        const readingCount = readingResponse.meta?.total || 0
        const completedCount = completedResponse.meta?.total || 0
        const plannedCount = plannedResponse.meta?.total || 0

        setStats({
          total: readingCount + completedCount + plannedCount,
          reading: readingCount,
          completed: completedCount,
          planned: plannedCount,
        })
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudieron cargar tus reviews.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadMyReviews()
  }, [searchParams])

  const handleDelete = async (review) => {
    if (!window.confirm('Deseas eliminar esta review?')) {
      return
    }

    try {
      setDeletingReviewId(review._id)
      await reviewApi.remove(review._id)
      setReviews((current) => current.filter((item) => item._id !== review._id))
      setStats((current) => ({
        ...current,
        total: Math.max(current.total - 1, 0),
        [review.status]: Math.max((current[review.status] || 1) - 1, 0),
      }))
      notify({
        variant: 'success',
        title: 'Review eliminada',
        message: 'La reseña fue eliminada de tu historial.',
      })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo eliminar la review.'))
    } finally {
      setDeletingReviewId('')
    }
  }

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

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Perfil"
        title="Mis reviews"
        description={`Gestiona las reseñas publicadas por ${user?.name || 'tu cuenta'} y actualiza su estado cuando quieras.`}
        actions={
          <Link to="/reviews/new" className="button button-primary">
            Nueva review
          </Link>
        }
      />

      <section className="stats-grid">
        <StatCard label="Total" value={stats.total} description="Reviews registradas en tu perfil." accent="amber" />
        <StatCard label="Reading" value={stats.reading} description="Lecturas actualmente en progreso." accent="blue" />
        <StatCard label="Completed" value={stats.completed} description="Obras terminadas y reseñadas." accent="green" />
        <StatCard label="Planned" value={stats.planned} description="Lecturas pendientes de comenzar." accent="slate" />
      </section>

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
        <Loader label="Cargando tus reviews..." />
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
          title="Aun no publicaste reviews"
          description="Crea tu primera reseña para empezar a construir tu historial de lectura."
          action={
            <Link to="/reviews/new" className="button button-primary">
              Crear review
            </Link>
          }
        />
      )}
    </div>
  )
}

export default MyReviewsPage
