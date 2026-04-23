import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

import mangaApi from '../api/mangaApi.js'
import reviewApi from '../api/reviewApi.js'
import { getApiErrorMessage } from '../api/axiosClient.js'
import Alert from '../components/common/Alert.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Loader from '../components/common/Loader.jsx'
import MangaCard from '../components/manga/MangaCard.jsx'
import ReviewCard from '../components/review/ReviewCard.jsx'
import StatCard from '../components/common/StatCard.jsx'

function HomePage() {
  const [featuredMangas, setFeaturedMangas] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [stats, setStats] = useState({ mangas: 0, reviews: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true)
        setError('')

        const [mangaResponse, reviewResponse] = await Promise.all([
          mangaApi.list({ limit: 4 }),
          reviewApi.list({ limit: 3 }),
        ])

        setFeaturedMangas(mangaResponse.data)
        setRecentReviews(reviewResponse.data)
        setStats({
          mangas: mangaResponse.meta?.total || mangaResponse.data.length,
          reviews: reviewResponse.meta?.total || reviewResponse.data.length,
        })
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar la portada inicial.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadHomeData()
  }, [])

  return (
    <div className="stack-xl">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="page-eyebrow">Proyecto Final</span>
          <h1>Tu biblioteca de mangas, resenas y progreso de lectura.</h1>
          <p>
            MangaTrack combina catalogo, seguimiento personal y resenas en una interfaz sobria,
            clara y lista para seguir creciendo como producto real.
          </p>

          <div className="hero-actions">
            <Link to="/mangas" className="button button-primary">
              Explorar catalogo
            </Link>
            <Link to="/reviews" className="button button-secondary">
              Ver reviews
            </Link>
          </div>
        </div>

        <div className="hero-stats">
          <StatCard label="Mangas cargados" value={stats.mangas} accent="amber" />
          <StatCard label="Reviews publicadas" value={stats.reviews} accent="blue" />
          <StatCard
            label="Enfoque"
            value="Full-stack"
            description="Seguimiento personal, catalogo editable y autenticacion con verificacion por email."
            accent="slate"
          />
        </div>
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Catalogo</span>
            <h2>Mangas destacados</h2>
          </div>
          <Link to="/mangas" className="button button-ghost">
            Ver todos
          </Link>
        </div>

        {isLoading ? (
          <Loader label="Cargando mangas destacados..." />
        ) : featuredMangas.length > 0 ? (
          <div className="card-grid card-grid-mangas">
            {featuredMangas.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavia no hay mangas cargados"
            description="Cuando se creen mangas desde la aplicacion, apareceran aqui para explorar el catalogo."
          />
        )}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="page-eyebrow">Actividad reciente</span>
            <h2>Ultimas reviews</h2>
          </div>
          <Link to="/reviews" className="button button-ghost">
            Ir al listado
          </Link>
        </div>

        {isLoading ? (
          <Loader label="Cargando reviews recientes..." />
        ) : recentReviews.length > 0 ? (
          <div className="stack-md">
            {recentReviews.map((review) => (
              <ReviewCard key={review._id} review={review} compact />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay reviews recientes"
            description="Las reseñas publicadas por los usuarios apareceran en esta seccion."
          />
        )}
      </section>
    </div>
  )
}

export default HomePage
