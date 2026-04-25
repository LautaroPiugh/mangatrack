import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'

import MangaCard from '../../components/manga/MangaCard.jsx'
import useAuth from '../../hooks/useAuth.js'
import mangaService from '../../services/mangaService.js'

const statusFilters = [
  { label: 'Todos', value: '' },
  { label: 'En publicación', value: 'ongoing' },
  { label: 'Finalizado', value: 'completed' },
  { label: 'En pausa', value: 'hiatus' },
  { label: 'Cancelado', value: 'cancelled' },
]

function MangasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [mangas, setMangas] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const isAdmin = user?.role === 'admin'
  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || ''
  const genre = searchParams.get('genre') || ''
  const page = Number.parseInt(searchParams.get('page') || '1', 10)

  useEffect(() => {
    let isMounted = true

    const loadMangas = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await mangaService.getMangas({
          q,
          status,
          genre,
          page,
          limit: 12,
          sort: q ? 'title' : 'rating',
        })

        if (!isMounted) {
          return
        }

        setMangas(response.items || [])
        setMeta(response.meta)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudieron cargar los mangas.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMangas()

    return () => {
      isMounted = false
    }
  }, [genre, page, q, status])

  const genreOptions = useMemo(() => {
    const values = new Set()

    if (genre) {
      values.add(genre)
    }

    mangas.forEach((manga) => {
      ;(manga.genres || []).forEach((item) => {
        if (item) {
          values.add(item)
        }
      })
    })

    return ['', ...Array.from(values).sort((left, right) => left.localeCompare(right))]
  }, [genre, mangas])

  const updateFilters = (nextFilters) => {
    const nextSearchParams = new URLSearchParams(searchParams)

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        nextSearchParams.set(key, value)
      } else {
        nextSearchParams.delete(key)
      }
    })

    if (Object.hasOwn(nextFilters, 'status') || Object.hasOwn(nextFilters, 'genre')) {
      nextSearchParams.set('page', '1')
    }

    if (Number.parseInt(nextSearchParams.get('page') || '1', 10) <= 1) {
      nextSearchParams.delete('page')
    }

    setSearchParams(nextSearchParams)
  }

  const goToPage = (nextPage) => {
    updateFilters({ page: nextPage > 1 ? String(nextPage) : '' })
  }

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>Explorar Mangas</h1>
          <p>Catálogo real conectado al backend. Buscá por título, autor, género o estado.</p>
          {meta?.total ? <p className="list-summary">{meta.total} mangas encontrados</p> : null}
        </div>

        <div className="list-header-actions">
          {isAdmin ? (
            <Link to="/admin/mangas/new" className="primary-action">
              Nuevo manga
            </Link>
          ) : null}

          <div className="filter-row">
            <span className="filter-icon">⌁</span>
            {statusFilters.map((item) => (
              <button
                key={item.label}
                type="button"
                className={status === item.value ? 'filter-pill filter-pill-active' : 'filter-pill'}
                onClick={() => updateFilters({ status: item.value })}
              >
                {item.label}
              </button>
            ))}
          </div>

          {genreOptions.length > 1 ? (
            <div className="filter-row">
              <span className="filter-icon">#</span>
              {genreOptions.slice(0, 7).map((item) => (
                <button
                  key={item || 'all-genres'}
                  type="button"
                  className={genre === item ? 'filter-pill filter-pill-active' : 'filter-pill'}
                  onClick={() => updateFilters({ genre: item })}
                >
                  {item || 'Todos los géneros'}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="figma-content">
        {isLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">⌛</span>
            <h2>Cargando mangas</h2>
            <p>Estamos consultando el catálogo real.</p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>No se pudieron cargar los mangas</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error && mangas.length ? (
          <>
            <div className="manga-grid manga-grid-wide">
              {mangas.map((manga) => (
                <MangaCard key={manga._id || manga.id || manga.slug} manga={manga} />
              ))}
            </div>

            {meta?.totalPages > 1 ? (
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
                  Página {meta.page} de {meta.totalPages}
                </span>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= meta.totalPages}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </>
        ) : null}

        {!isLoading && !error && !mangas.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">本</span>
            <h2>No se encontraron mangas</h2>
            <p>Probá con otra búsqueda o ajustá los filtros.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default MangasPage
