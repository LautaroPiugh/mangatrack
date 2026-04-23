import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import mangaApi from '../../api/mangaApi.js'
import { getApiErrorMessage } from '../../api/axiosClient.js'
import Alert from '../../components/common/Alert.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Field from '../../components/common/Field.jsx'
import Loader from '../../components/common/Loader.jsx'
import PageHeader from '../../components/common/PageHeader.jsx'
import Pagination from '../../components/common/Pagination.jsx'
import MangaCard from '../../components/manga/MangaCard.jsx'
import useAuth from '../../hooks/useAuth.js'

const buildSearchParams = (filters) => {
  const nextSearchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      nextSearchParams.set(key, String(value))
    }
  })

  return nextSearchParams
}

function MangasPage() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
  })
  const [mangas, setMangas] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadMangas = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await mangaApi.list({
          search: searchParams.get('search') || undefined,
          genre: searchParams.get('genre') || undefined,
          page: searchParams.get('page') || 1,
        })

        setMangas(response.data)
        setMeta(response.meta)
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'No se pudo cargar el catalogo de mangas.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadMangas()
  }, [searchParams])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const handleFilterSubmit = (event) => {
    event.preventDefault()
    setSearchParams(buildSearchParams({
      search: filters.search,
      genre: filters.genre,
      page: 1,
    }))
  }

  const handlePageChange = (page) => {
    setSearchParams(buildSearchParams({
      search: searchParams.get('search') || '',
      genre: searchParams.get('genre') || '',
      page,
    }))
  }

  return (
    <div className="stack-lg">
      <PageHeader
        eyebrow="Catalogo"
        title="Explorar mangas"
        description="Busca por titulo, autor o genero y navega un catalogo editable desde la aplicacion."
        actions={isAuthenticated ? (
          <Link to="/mangas/new" className="button button-primary">
            Cargar manga
          </Link>
        ) : null}
      />

      <section className="panel">
        <form className="filter-grid" onSubmit={handleFilterSubmit}>
          <Field
            label="Busqueda"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Ej. Berserk, Urasawa, Seinen"
          />
          <Field
            label="Genero"
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
            placeholder="Ej. Drama"
          />

          <div className="field-actions">
            <button type="submit" className="button button-primary">
              Filtrar
            </button>
          </div>
        </form>
      </section>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {isLoading ? (
        <Loader label="Cargando catalogo..." />
      ) : mangas.length > 0 ? (
        <>
          <div className="card-grid card-grid-mangas">
            {mangas.map((manga) => (
              <MangaCard key={manga._id} manga={manga} />
            ))}
          </div>

          <Pagination meta={meta} onPageChange={handlePageChange} />
        </>
      ) : (
        <EmptyState
          title="No hay mangas para mostrar"
          description="Prueba ajustando los filtros o crea un nuevo manga para iniciar el catalogo."
          action={isAuthenticated ? (
            <Link to="/mangas/new" className="button button-primary">
              Crear manga
            </Link>
          ) : null}
        />
      )}
    </div>
  )
}

export default MangasPage
