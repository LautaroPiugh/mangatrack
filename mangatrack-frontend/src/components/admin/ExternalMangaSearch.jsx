import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useFeedback from '../../hooks/useFeedback.js'
import externalMangaService from '../../services/externalMangaService.js'

const FILTER_DEFAULTS = {
  q: '',
  genre: '',
  status: '',
  type: '',
  orderBy: 'popularity',
  sort: 'asc',
  year: '',
  minScore: '',
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'publishing', label: 'En publicación' },
  { value: 'complete', label: 'Finalizado' },
  { value: 'hiatus', label: 'En pausa' },
  { value: 'discontinued', label: 'Discontinuado' },
  { value: 'upcoming', label: 'Próximamente' },
]

const TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'manga', label: 'Manga' },
  { value: 'novel', label: 'Novela' },
  { value: 'lightnovel', label: 'Light Novel' },
  { value: 'oneshot', label: 'One-shot' },
  { value: 'doujin', label: 'Doujin' },
  { value: 'manhwa', label: 'Manhwa' },
  { value: 'manhua', label: 'Manhua' },
]

const ORDER_OPTIONS = [
  { value: 'popularity', label: 'Popularidad' },
  { value: 'rank', label: 'Ranking' },
  { value: 'score', label: 'Score' },
  { value: 'start_date', label: 'Fecha de inicio' },
  { value: 'chapters', label: 'Capítulos' },
  { value: 'volumes', label: 'Volúmenes' },
  { value: 'members', label: 'Seguidores' },
]

const PRESET_ACTIONS = [
  { id: 'popular', label: 'Populares', description: 'Top por popularidad', mode: 'top', params: { filter: 'bypopularity', limit: 12 } },
  { id: 'topRated', label: 'Mejor puntuados', description: 'Ordenados por score', mode: 'search', params: { orderBy: 'score', sort: 'desc', limit: 12 } },
  { id: 'recent', label: 'Recientes', description: 'Lanzamientos más nuevos', mode: 'search', params: { orderBy: 'start_date', sort: 'desc', limit: 12 } },
]

const formatYear = (date) => {
  if (!date) {
    return 'Sin fecha'
  }

  return new Date(date).getFullYear()
}

const formatStatusLabel = (status) => {
  const labels = {
    ongoing: 'En publicación',
    completed: 'Finalizado',
    hiatus: 'En pausa',
    cancelled: 'Cancelado',
  }

  return labels[status] || status || 'Sin estado'
}

const formatMetric = (value, { prefix = '', fallback = 'N/A' } = {}) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return `${prefix}${value}`
}

const formatCompactNumber = (value) => {
  if (value === null || value === undefined) {
    return 'N/A'
  }

  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

const shortenSynopsis = (synopsis = '', maxLength = 180) => {
  if (!synopsis) {
    return 'Sin sinopsis disponible.'
  }

  return synopsis.length > maxLength
    ? `${synopsis.slice(0, maxLength).trim()}...`
    : synopsis
}

function ExternalResultCard({ manga, onOpenDetail, onOpenImport, onPrefill }) {
  return (
    <article className="external-browser-card">
      <div className="external-browser-card-poster">
        <img
          src={manga.coverImage || manga.coverUrl || '/placeholder-manga.jpg'}
          alt={manga.title}
          onError={(event) => {
            event.target.src = '/placeholder-manga.jpg'
          }}
        />
      </div>

      <div className="external-browser-card-body">
        <div className="external-browser-card-header">
          <div>
            <h4>{manga.title}</h4>
            <p>{manga.titleEnglish || manga.titleJapanese || manga.type || 'Manga'}</p>
          </div>
          <span className="external-browser-score">
            {formatMetric(manga.score, { prefix: '★ ' })}
          </span>
        </div>

        <div className="external-browser-metrics">
          <span>{formatStatusLabel(manga.status)}</span>
          <span>Rank #{formatMetric(manga.rank)}</span>
          <span>Popularidad #{formatMetric(manga.popularity)}</span>
        </div>

        <div className="external-browser-tags">
          {manga.genres?.slice(0, 4).map((genre) => (
            <span key={genre} className="external-browser-tag">
              {genre}
            </span>
          ))}
        </div>

        <p className="external-browser-synopsis">{shortenSynopsis(manga.synopsis)}</p>

        <div className="external-browser-card-footer">
          <span>{formatYear(manga.publishedFrom)}</span>
          <span>{formatCompactNumber(manga.members)} seguidores</span>
        </div>

        <div className="external-browser-card-actions">
          <button type="button" className="external-browser-btn subtle" onClick={() => onOpenDetail(manga)}>
            Ver detalle
          </button>
          <button type="button" className="external-browser-btn secondary" onClick={() => onPrefill(manga)}>
            Editar en formulario
          </button>
          <button type="button" className="external-browser-btn primary" onClick={() => onOpenImport(manga)}>
            Importar
          </button>
        </div>
      </div>
    </article>
  )
}

function ExternalMangaSearch({ onUseData, onSwitchToManual }) {
  const navigate = useNavigate()
  const { notify } = useFeedback()

  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [genres, setGenres] = useState([])
  const [results, setResults] = useState([])
  const [meta, setMeta] = useState(null)
  const [activePreset, setActivePreset] = useState('popular')
  const [resultsTitle, setResultsTitle] = useState('Populares en MyAnimeList')
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailManga, setDetailManga] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [importCandidate, setImportCandidate] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadInitialState = async () => {
      try {
        const [genreItems, topResponse] = await Promise.all([
          externalMangaService.getExternalMangaGenres(),
          externalMangaService.getTopExternalMangas({ filter: 'bypopularity', limit: 12 }),
        ])

        if (!isMounted) {
          return
        }

        setGenres(genreItems)
        setResults(topResponse.items)
        setMeta(topResponse.meta)
        setResultsTitle('Populares en MyAnimeList')
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudieron cargar los mangas externos.')
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void loadInitialState()

    return () => {
      isMounted = false
    }
  }, [])

  const updateFilter = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const handlePrefill = (manga) => {
    onUseData(manga)
    onSwitchToManual?.()
    notify({
      variant: 'info',
      title: 'Formulario precompletado',
      message: `Se cargaron los datos de "${manga.title}" para que los revises antes de guardar.`,
    })
  }

  const runSearch = async (nextFilters = filters) => {
    setIsLoading(true)
    setError('')
    setActivePreset('')

    try {
      const response = await externalMangaService.searchExternalMangas({
        ...nextFilters,
        limit: 12,
      })

      setResults(response.items)
      setMeta(response.meta)
      setResultsTitle(
        nextFilters.q?.trim()
          ? `Resultados para "${nextFilters.q.trim()}"`
          : 'Exploración avanzada',
      )
    } catch (searchError) {
      setResults([])
      setMeta(null)
      setError(searchError.message || 'No se pudieron buscar mangas externos.')
    } finally {
      setIsLoading(false)
    }
  }

  const runPreset = async (presetId) => {
    const preset = PRESET_ACTIONS.find((item) => item.id === presetId)

    if (!preset) {
      return
    }

    setIsLoading(true)
    setError('')
    setActivePreset(presetId)

    try {
      if (preset.mode === 'top') {
        const response = await externalMangaService.getTopExternalMangas(preset.params)
        setResults(response.items)
        setMeta(response.meta)
      } else {
        const response = await externalMangaService.searchExternalMangas(preset.params)
        setResults(response.items)
        setMeta(response.meta)
      }

      setResultsTitle(preset.description)
    } catch (presetError) {
      setResults([])
      setMeta(null)
      setError(presetError.message || 'No se pudo cargar el preset externo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    void runSearch()
  }

  const handleResetFilters = () => {
    setFilters(FILTER_DEFAULTS)
    void runPreset('popular')
  }

  const handleOpenDetail = async (manga) => {
    setDetailManga(manga)
    setIsDetailLoading(true)

    try {
      const detail = await externalMangaService.getExternalMangaById(manga.externalId)
      setDetailManga(detail)
    } catch (detailError) {
      notify({
        variant: 'error',
        title: 'Detalle no disponible',
        message: detailError.message || 'No se pudo cargar el detalle del manga.',
      })
    } finally {
      setIsDetailLoading(false)
    }
  }

  const handleCloseDetail = () => {
    if (isDetailLoading) {
      return
    }

    setDetailManga(null)
  }

  const handleOpenImport = (manga) => {
    setImportCandidate(manga)
  }

  const handleCloseImport = () => {
    if (isImporting) {
      return
    }

    setImportCandidate(null)
  }

  const handleImportNow = async () => {
    if (!importCandidate) {
      return
    }

    setIsImporting(true)

    try {
      const result = await externalMangaService.importExternalManga({
        source: importCandidate.source,
        malId: importCandidate.externalId,
      })

      notify({
        variant: result.duplicate ? 'info' : 'success',
        title: result.duplicate ? 'Manga existente' : 'Manga importado',
        message: result.duplicate
          ? `Ya existía un registro para "${result.manga.title}".`
          : `"${result.manga.title}" ya está en MangaTrack.`,
      })

      setImportCandidate(null)
      navigate(`/admin/mangas/${result.manga._id}/edit`)
    } catch (importError) {
      notify({
        variant: 'error',
        title: 'Importación fallida',
        message: importError.message || 'No se pudo importar el manga.',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const resultCountLabel = meta?.total
    ? `${results.length} resultados visibles de ${meta.total}`
    : `${results.length} resultados`

  return (
    <section className="external-browser">
      <div className="external-browser-header">
        <div>
          <span className="external-browser-kicker">Jikan + MyAnimeList</span>
          <h3>Buscar e importar</h3>
          <p>Explorá el catálogo externo con filtros reales, revisá el detalle y traé datos al formulario o importá directo.</p>
        </div>
      </div>

      <form className="external-browser-searchbar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={filters.q}
          onChange={(event) => updateFilter('q', event.target.value)}
          placeholder="Título, alias, autor o búsqueda libre..."
          className="external-browser-input search"
        />
        <button type="submit" className="external-browser-btn primary" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <div className="external-browser-filters">
        <select
          value={filters.genre}
          onChange={(event) => updateFilter('genre', event.target.value)}
          className="external-browser-input"
        >
          <option value="">Todos los géneros</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          className="external-browser-input"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value || 'all'} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(event) => updateFilter('type', event.target.value)}
          className="external-browser-input"
        >
          {TYPE_OPTIONS.map((type) => (
            <option key={type.value || 'all'} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <select
          value={filters.orderBy}
          onChange={(event) => updateFilter('orderBy', event.target.value)}
          className="external-browser-input"
        >
          {ORDER_OPTIONS.map((order) => (
            <option key={order.value} value={order.value}>
              Ordenar por {order.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
          className="external-browser-input"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        <input
          type="number"
          min="1900"
          max="2100"
          placeholder="Año"
          value={filters.year}
          onChange={(event) => updateFilter('year', event.target.value)}
          className="external-browser-input"
        />

        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder="Score mínimo"
          value={filters.minScore}
          onChange={(event) => updateFilter('minScore', event.target.value)}
          className="external-browser-input"
        />
      </div>

      <div className="external-browser-toolbar">
        <div className="external-browser-presets">
          {PRESET_ACTIONS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`external-browser-preset ${activePreset === preset.id ? 'active' : ''}`}
              onClick={() => {
                void runPreset(preset.id)
              }}
              disabled={isLoading}
            >
              <strong>{preset.label}</strong>
              <span>{preset.description}</span>
            </button>
          ))}
        </div>

        <button type="button" className="external-browser-btn subtle" onClick={handleResetFilters} disabled={isLoading}>
          Resetear filtros
        </button>
      </div>

      <div className="external-browser-results-header">
        <div>
          <h4>{resultsTitle}</h4>
          <p>{resultCountLabel}</p>
        </div>
      </div>

      {error ? <p className="external-browser-error">{error}</p> : null}

      {isBootstrapping ? (
        <div className="external-browser-empty">
          <strong>Cargando catálogo externo...</strong>
          <span>Preparando géneros, presets y resultados iniciales.</span>
        </div>
      ) : null}

      {!isBootstrapping && !isLoading && results.length === 0 ? (
        <div className="external-browser-empty">
          <strong>Sin resultados</strong>
          <span>Probá con otro título, un género distinto o alguno de los accesos rápidos.</span>
        </div>
      ) : null}

      {results.length > 0 ? (
        <div className="external-browser-grid">
          {results.map((manga) => (
            <ExternalResultCard
              key={manga.externalId}
              manga={manga}
              onOpenDetail={handleOpenDetail}
              onOpenImport={handleOpenImport}
              onPrefill={handlePrefill}
            />
          ))}
        </div>
      ) : null}

      {detailManga ? (
        <div className="admin-modal-overlay" onClick={handleCloseDetail}>
          <div className="admin-modal-panel external-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={handleCloseDetail} disabled={isDetailLoading}>
              ×
            </button>

            {isDetailLoading ? (
              <div className="external-detail-loading">
                <strong>Cargando detalle...</strong>
                <span>Consultando MyAnimeList vía Jikan.</span>
              </div>
            ) : (
              <>
                <div className="external-detail-hero">
                  <img
                    src={detailManga.coverImage || detailManga.coverUrl || '/placeholder-manga.jpg'}
                    alt={detailManga.title}
                    onError={(event) => {
                      event.target.src = '/placeholder-manga.jpg'
                    }}
                  />

                  <div>
                    <span className="external-browser-kicker">Detalle externo</span>
                    <h3>{detailManga.title}</h3>
                    <p>{detailManga.titleEnglish || detailManga.titleJapanese || detailManga.type || 'Manga'}</p>

                    <div className="external-detail-stats">
                      <span>Score {formatMetric(detailManga.score)}</span>
                      <span>Rank #{formatMetric(detailManga.rank)}</span>
                      <span>Popularidad #{formatMetric(detailManga.popularity)}</span>
                    </div>

                    <div className="external-browser-tags">
                      {detailManga.genres?.map((genre) => (
                        <span key={genre} className="external-browser-tag">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="external-detail-grid">
                  <div>
                    <h4>Títulos alternativos</h4>
                    <ul className="external-detail-list">
                      <li>Inglés: {detailManga.titleEnglish || 'N/A'}</li>
                      <li>Japonés: {detailManga.titleJapanese || 'N/A'}</li>
                      <li>Sinónimos: {detailManga.titleSynonyms?.join(', ') || 'N/A'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4>Ficha</h4>
                    <ul className="external-detail-list">
                      <li>Estado: {formatStatusLabel(detailManga.status)}</li>
                      <li>Tipo: {detailManga.type || 'N/A'}</li>
                      <li>Capítulos: {formatMetric(detailManga.chapters)}</li>
                      <li>Volúmenes: {formatMetric(detailManga.volumes)}</li>
                      <li>Publicado desde: {detailManga.publishedFrom ? new Date(detailManga.publishedFrom).toLocaleDateString() : 'N/A'}</li>
                      <li>Publicado hasta: {detailManga.publishedTo ? new Date(detailManga.publishedTo).toLocaleDateString() : 'N/A'}</li>
                    </ul>
                  </div>

                  <div>
                    <h4>Autores</h4>
                    <ul className="external-detail-list">
                      {detailManga.authors?.length ? (
                        detailManga.authors.map((author) => (
                          <li key={author}>{author}</li>
                        ))
                      ) : (
                        <li>Sin autores informados.</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="external-detail-copy">
                  <h4>Sinopsis</h4>
                  <p>{detailManga.synopsis || 'Sin sinopsis disponible.'}</p>
                </div>

                <div className="external-detail-actions">
                  <button type="button" className="external-browser-btn secondary" onClick={() => handlePrefill(detailManga)}>
                    Editar en formulario
                  </button>
                  <button type="button" className="external-browser-btn primary" onClick={() => handleOpenImport(detailManga)}>
                    Importar
                  </button>
                  {detailManga.url ? (
                    <a href={detailManga.url} target="_blank" rel="noreferrer" className="external-browser-link">
                      Ver en MyAnimeList
                    </a>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {importCandidate ? (
        <div className="admin-modal-overlay" onClick={handleCloseImport}>
          <div className="admin-modal-panel import-decision-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={handleCloseImport} disabled={isImporting}>
              ×
            </button>

            <span className="external-browser-kicker">Confirmar importación</span>
            <h3>{importCandidate.title}</h3>
            <p>Podés revisar los datos en el formulario antes de guardar o importarlo directo al catálogo interno.</p>

            <div className="import-decision-summary">
              <span>Score {formatMetric(importCandidate.score)}</span>
              <span>{formatStatusLabel(importCandidate.status)}</span>
              <span>{formatCompactNumber(importCandidate.members)} seguidores</span>
            </div>

            <div className="import-decision-actions">
              <button
                type="button"
                className="external-browser-btn subtle"
                onClick={handleCloseImport}
                disabled={isImporting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="external-browser-btn secondary"
                onClick={() => handlePrefill(importCandidate)}
                disabled={isImporting}
              >
                Editar antes de guardar
              </button>
              <button
                type="button"
                className="external-browser-btn primary"
                onClick={handleImportNow}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : 'Importar y abrir en admin'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ExternalMangaSearch
