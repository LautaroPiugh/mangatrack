import { useEffect, useState } from 'react'

import MangaCard from '../components/manga/MangaCard.jsx'
import ReviewCard from '../components/review/ReviewCard.jsx'
import mangaService from '../services/mangaService.js'
import reviewService from '../services/reviewService.js'

const stats = [
  { label: 'Mangas leídos', value: '47', icon: '本', color: 'green' },
  { label: 'Reseñas escritas', value: '23', icon: '★', color: 'orange' },
  { label: 'Pendientes', value: '12', icon: '◷', color: 'blue' },
  { label: 'Horas de lectura', value: '156', icon: '↗', color: 'purple' },
]

function HomePage() {
  const [trendingMangas, setTrendingMangas] = useState([])
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [trendingError, setTrendingError] = useState('')
  const [recentReviews, setRecentReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewsError, setReviewsError] = useState('')

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

        setTrendingError(error.message || 'No se pudieron cargar las tendencias.')
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
  }, [])

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

        setReviewsError(error.message || 'No se pudieron cargar las reseñas recientes.')
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
  }, [])

  return (
    <div className="figma-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <h1>Descubrí, valorá y organizá tus mangas favoritos.</h1>
          <p>Seguí tus lecturas, guardá pendientes y compartí reseñas breves.</p>
        </div>
      </section>

      <div className="figma-content">
        <section className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card stat-card-${stat.color}`}>
              <span className="stat-icon">{stat.icon}</span>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>↗</span>
            <h2>Tendencias</h2>
          </div>
          {isLoadingTrending ? (
            <div className="empty-state">
              <span className="empty-state-icon">⌛</span>
              <h2>Cargando tendencias</h2>
              <p>Consultando los mangas mejor valorados.</p>
            </div>
          ) : null}
          {!isLoadingTrending && trendingError ? (
            <div className="empty-state">
              <span className="empty-state-icon">!</span>
              <h2>No se pudieron cargar las tendencias</h2>
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
              <h2>No hay mangas destacados</h2>
              <p>El catálogo real todavía no tiene datos para esta sección.</p>
            </div>
          ) : null}
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>★</span>
            <h2>Reseñas recientes</h2>
          </div>
          {isLoadingReviews ? (
            <div className="empty-state">
              <span className="empty-state-icon">⌛</span>
              <h2>Cargando reseñas</h2>
              <p>Buscando las últimas reviews públicas.</p>
            </div>
          ) : null}
          {!isLoadingReviews && reviewsError ? (
            <div className="empty-state">
              <span className="empty-state-icon">!</span>
              <h2>No se pudieron cargar las reseñas</h2>
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
              <h2>No hay reseñas recientes</h2>
              <p>Todavía no se publicaron reviews nuevas.</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default HomePage
