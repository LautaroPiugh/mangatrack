import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import useFeedback from '../../hooks/useFeedback.js'
import mangaService from '../../services/mangaService.js'

const ADMIN_MANGAS_PAGE_SIZE = 50

function AdminMangasPage() {
  const navigate = useNavigate()
  const { notify } = useFeedback()
  const [mangas, setMangas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [mangaPendingDelete, setMangaPendingDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMangas = useCallback(async (searchQuery = '') => {
    const allItems = []
    let currentPage = 1
    let totalPages = 1

    do {
      const result = await mangaService.getMangas({
        q: searchQuery,
        page: currentPage,
        limit: ADMIN_MANGAS_PAGE_SIZE,
        sort: 'title'
      })

      allItems.push(...(result.items || []))
      totalPages = result.meta?.totalPages || 1
      currentPage += 1
    } while (currentPage <= totalPages)

    return allItems
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadInitialMangas = async () => {
      try {
        const items = await fetchMangas()

        if (!isMounted) {
          return
        }

        setMangas(items)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Error al cargar mangas')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialMangas()

    return () => {
      isMounted = false
    }
  }, [fetchMangas])

  const loadMangas = async (searchQuery = '') => {
    setIsSearching(true)
    setError('')

    try {
      const items = await fetchMangas(searchQuery)
      setMangas(items)
    } catch {
      setError('Error al cargar mangas')
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadMangas(search)
  }

  const openDeleteDialog = (manga) => {
    setMangaPendingDelete(manga)
  }

  const closeDeleteDialog = () => {
    if (isDeleting) {
      return
    }

    setMangaPendingDelete(null)
  }

  const handleDelete = async () => {
    if (!mangaPendingDelete) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await mangaService.deleteManga(mangaPendingDelete._id)
      setMangas((currentMangas) => currentMangas.filter((manga) => manga._id !== mangaPendingDelete._id))
      notify({
        variant: 'success',
        title: 'Manga eliminado',
        message: `"${mangaPendingDelete.title}" se eliminó correctamente.`,
      })
      setMangaPendingDelete(null)
    } catch (deleteError) {
      const errorMessage = deleteError.message || 'Error al eliminar manga'
      setError(errorMessage)
      notify({
        variant: 'error',
        title: 'No se pudo eliminar',
        message: errorMessage,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      ongoing: 'En publicación',
      completed: 'Finalizado',
      hiatus: 'En pausa',
      cancelled: 'Cancelado'
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <div className="admin-mangas-page">
        <div className="admin-page-header">
          <h1>Gestión de mangas</h1>
          <p>Cargando mangas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-mangas-page">
      <div className="admin-page-header">
        <h1>Gestión de mangas</h1>
        <p>Administra todos los mangas de la plataforma</p>
      </div>

      {error && (
        <div className="admin-error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="admin-mangas-header">
        <form onSubmit={handleSearch} className="admin-mangas-search">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-mangas-search-input"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="admin-mangas-create-btn"
            style={{ background: 'var(--blue)' }}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <Link to="/admin/mangas/new" className="admin-mangas-create-btn">
          Nuevo manga
        </Link>
      </div>

      {mangas.length === 0 ? (
        <div className="admin-mangas-empty">
          <p>No se encontraron mangas</p>
          {search && (
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              Prueba con una búsqueda diferente o <button
                onClick={() => {
                  setSearch('')
                  loadMangas('')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--blue)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ver todos los mangas
              </button>
            </p>
          )}
        </div>
      ) : (
        <div className="admin-mangas-grid">
          {mangas.map(manga => (
            <div key={manga._id} className="admin-manga-card">
              <div className="admin-manga-card-image">
                <img
                  src={manga.coverUrl || '/placeholder-manga.jpg'}
                  alt={manga.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-manga.jpg'
                  }}
                />
              </div>
              <div className="admin-manga-card-content">
                <h3 className="admin-manga-card-title">{manga.title}</h3>
                <div className="admin-manga-card-meta">
                  <span className={`admin-manga-card-status ${manga.status}`}>
                    {getStatusLabel(manga.status)}
                  </span>
                  <span>{manga.averageRating?.toFixed(1) || 'N/A'} ⭐</span>
                </div>
                <div className="admin-manga-card-actions">
                  <button
                    onClick={() => navigate(`/admin/mangas/${manga._id}/edit`)}
                    className="admin-manga-card-btn edit"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => openDeleteDialog(manga)}
                    className="admin-manga-card-btn delete"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {mangaPendingDelete ? (
        <div className="admin-confirm-overlay" onClick={closeDeleteDialog}>
          <div
            className="admin-confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-delete-title"
            aria-describedby="admin-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="admin-confirm-eyebrow">Eliminar manga</span>
            <h2 id="admin-delete-title" className="admin-confirm-title">
              Confirmá esta acción
            </h2>
            <p id="admin-delete-description" className="admin-confirm-copy">
              Vas a eliminar <strong>{mangaPendingDelete.title}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="admin-confirm-actions">
              <button
                type="button"
                className="admin-confirm-btn secondary"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-confirm-btn danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar manga'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AdminMangasPage
