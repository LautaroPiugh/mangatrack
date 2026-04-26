import { useEffect, useMemo, useState } from 'react'

import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
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

const RESULTS_PER_PAGE_OPTIONS = [12, 24]
const DEFAULT_PAGE_SIZE = RESULTS_PER_PAGE_OPTIONS[0]

const formatYear = (date, fallback) => {
  if (!date) {
    return fallback
  }

  return new Date(date).getFullYear()
}

const formatMetric = (value, { prefix = '', fallback = 'N/A' } = {}) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  return `${prefix}${value}`
}

const formatCompactNumber = (value, locale, fallback = 'N/A') => {
  if (value === null || value === undefined) {
    return fallback
  }

  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

const shortenSynopsis = (synopsis = '', maxLength = 180, fallback) => {
  if (!synopsis) {
    return fallback
  }

  return synopsis.length > maxLength
    ? `${synopsis.slice(0, maxLength).trim()}...`
    : synopsis
}

function ExternalResultCard({ manga, onOpenDetail, onOpenImport, onPrefill, t, locale, formatStatusLabel }) {
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
            <p>{manga.titleEnglish || manga.titleJapanese || manga.type || t('common.manga')}</p>
          </div>
          <span className="external-browser-score">
            {formatMetric(manga.score, { prefix: '★ ', fallback: t('common.notAvailable') })}
          </span>
        </div>

        <div className="external-browser-metrics">
          <span>{formatStatusLabel(manga.status)}</span>
          <span>{t('admin.rankLabel', { value: formatMetric(manga.rank, { fallback: t('common.notAvailable') }) })}</span>
          <span>{t('admin.popularityLabel', { value: formatMetric(manga.popularity, { fallback: t('common.notAvailable') }) })}</span>
        </div>

        <div className="external-browser-tags">
          {manga.genres?.slice(0, 4).map((genre) => (
            <span key={genre} className="external-browser-tag">
              {genre}
            </span>
          ))}
        </div>

        <p className="external-browser-synopsis">{shortenSynopsis(manga.synopsis, 180, t('admin.noSynopsis'))}</p>

        <div className="external-browser-card-footer">
          <span>{formatYear(manga.publishedFrom, t('common.noDate'))}</span>
          <span>{t('common.followers', { count: formatCompactNumber(manga.members, locale, t('common.notAvailable')) })}</span>
        </div>

        <div className="external-browser-card-actions">
          <button type="button" className="external-browser-btn subtle" onClick={() => onOpenDetail(manga)}>
            {t('common.viewDetails')}
          </button>
          <button type="button" className="external-browser-btn secondary" onClick={() => onPrefill(manga)}>
            {t('common.editInForm')}
          </button>
          <button type="button" className="external-browser-btn primary" onClick={() => onOpenImport(manga)}>
            {t('common.import')}
          </button>
        </div>
      </div>
    </article>
  )
}

function ExternalMangaSearch({ onUseData, onSwitchToManual }) {
  const { notify } = useFeedback()
  const { language, t } = useI18n()
  const locale = language === 'en' ? 'en-US' : 'es-AR'

  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const [genres, setGenres] = useState([])
  const [results, setResults] = useState([])
  const [pagination, setPagination] = useState(null)
  const [activePreset, setActivePreset] = useState('popular')
  const [resultsContext, setResultsContext] = useState({ type: 'preset', presetId: 'popular', query: '' })
  const [currentRequest, setCurrentRequest] = useState({
    mode: 'top',
    params: { filter: 'bypopularity', page: 1, limit: DEFAULT_PAGE_SIZE },
  })
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detailManga, setDetailManga] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [importCandidate, setImportCandidate] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  const statusOptions = useMemo(() => [
    { value: '', label: t('admin.allStatuses') },
    { value: 'publishing', label: t('admin.statusOptions.publishing') },
    { value: 'complete', label: t('admin.statusOptions.complete') },
    { value: 'hiatus', label: t('admin.statusOptions.hiatus') },
    { value: 'discontinued', label: t('admin.statusOptions.discontinued') },
    { value: 'upcoming', label: t('admin.statusOptions.upcoming') },
  ], [t])

  const typeOptions = useMemo(() => [
    { value: '', label: t('admin.allTypes') },
    { value: 'manga', label: t('admin.typeOptions.manga') },
    { value: 'novel', label: t('admin.typeOptions.novel') },
    { value: 'lightnovel', label: t('admin.typeOptions.lightnovel') },
    { value: 'oneshot', label: t('admin.typeOptions.oneshot') },
    { value: 'doujin', label: t('admin.typeOptions.doujin') },
    { value: 'manhwa', label: t('admin.typeOptions.manhwa') },
    { value: 'manhua', label: t('admin.typeOptions.manhua') },
  ], [t])

  const orderOptions = useMemo(() => [
    { value: 'popularity', label: t('admin.orderOptions.popularity') },
    { value: 'rank', label: t('admin.orderOptions.rank') },
    { value: 'score', label: t('admin.orderOptions.score') },
    { value: 'start_date', label: t('admin.orderOptions.start_date') },
    { value: 'chapters', label: t('admin.orderOptions.chapters') },
    { value: 'volumes', label: t('admin.orderOptions.volumes') },
    { value: 'members', label: t('admin.orderOptions.members') },
  ], [t])

  const presetActions = useMemo(() => [
    { id: 'popular', label: t('admin.popular'), description: t('admin.popularDescription'), mode: 'top', params: { filter: 'bypopularity' } },
    { id: 'topRated', label: t('admin.topRated'), description: t('admin.topRatedDescription'), mode: 'search', params: { orderBy: 'score', sort: 'desc' } },
    { id: 'recent', label: t('admin.recent'), description: t('admin.recentDescription'), mode: 'search', params: { orderBy: 'start_date', sort: 'desc' } },
  ], [t])

  const formatStatusLabel = (status) => {
    const labels = {
      ongoing: t('admin.statusOptions.publishing'),
      completed: t('admin.statusOptions.complete'),
      hiatus: t('admin.statusOptions.hiatus'),
      cancelled: t('admin.statusOptions.discontinued'),
    }

    return labels[status] || status || t('admin.form.noStatus')
  }

  const getResultsTitle = () => {
    if (resultsContext.type === 'search' && resultsContext.query) {
      return t('admin.resultsTitleForQuery', { query: resultsContext.query })
    }

    if (resultsContext.type === 'preset') {
      if (resultsContext.presetId === 'popular') {
        return t('admin.popularTitle')
      }

      const preset = presetActions.find((item) => item.id === resultsContext.presetId)
      return preset?.description || t('admin.resultsTitleDefault')
    }

    return t('admin.resultsTitleDefault')
  }

  const applyResponse = (response, nextRequest, nextResultsContext, nextPresetId = '') => {
    setResults(response.items || [])
    setPagination(response.pagination || response.meta || null)
    setCurrentRequest(nextRequest)
    setResultsContext(nextResultsContext)
    setActivePreset(nextPresetId)
  }

  const executeRequest = async (mode, params, nextResultsContext, nextPresetId = '') => {
    const normalizedParams = {
      ...params,
      page: Math.max(Number.parseInt(params.page, 10) || 1, 1),
      limit: Number.parseInt(params.limit, 10) || pageSize,
    }

    const nextRequest = {
      mode,
      params: normalizedParams,
    }

    const response = mode === 'top'
      ? await externalMangaService.getTopExternalMangas(normalizedParams)
      : await externalMangaService.searchExternalMangas(normalizedParams)

    applyResponse(response, nextRequest, nextResultsContext, nextPresetId)
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialState = async () => {
      try {
        const [genreItems, topResponse] = await Promise.all([
          externalMangaService.getExternalMangaGenres(),
          externalMangaService.getTopExternalMangas({ filter: 'bypopularity', page: 1, limit: DEFAULT_PAGE_SIZE }),
        ])

        if (!isMounted) {
          return
        }

        setGenres(genreItems)
        applyResponse(topResponse, {
          mode: 'top',
          params: { filter: 'bypopularity', page: 1, limit: DEFAULT_PAGE_SIZE },
        }, { type: 'preset', presetId: 'popular', query: '' }, 'popular')
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || t('admin.loadErrorMessage'))
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
  }, [t])

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
      title: t('admin.prefilledTitle'),
      message: t('admin.prefilledMessage', { title: manga.title }),
    })
  }

  const runSearch = async (nextFilters = filters, page = 1, limit = pageSize) => {
    setIsLoading(true)
    setError('')
    setActivePreset('')

    try {
      await executeRequest('search', {
        ...nextFilters,
        page,
        limit,
      }, {
        type: nextFilters.q?.trim() ? 'search' : 'default',
        presetId: '',
        query: nextFilters.q?.trim() || '',
      })
    } catch (searchError) {
      setResults([])
      setPagination(null)
      setError(searchError.message || t('admin.searchErrorMessage'))
      notify({
        variant: 'error',
        title: t('admin.searchErrorTitle'),
        message: searchError.message || t('admin.searchErrorMessage'),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runPreset = async (presetId, options = {}) => {
    const preset = presetActions.find((item) => item.id === presetId)

    if (!preset) {
      return
    }

    setIsLoading(true)
    setError('')
    setActivePreset(presetId)

    try {
      await executeRequest(preset.mode, {
        ...preset.params,
        page: options.page || 1,
        limit: options.limit || pageSize,
      }, {
        type: 'preset',
        presetId,
        query: '',
      }, presetId)
    } catch (presetError) {
      setResults([])
      setPagination(null)
      setError(presetError.message || t('admin.searchErrorMessage'))
      notify({
        variant: 'error',
        title: t('admin.presetErrorTitle'),
        message: presetError.message || t('admin.searchErrorMessage'),
      })
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
    void runPreset('popular', { page: 1, limit: pageSize })
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
        title: t('admin.detailUnavailableTitle'),
        message: detailError.message || t('admin.detailUnavailableMessage'),
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
        variant: result.duplicate ? 'warning' : 'success',
        title: result.duplicate ? t('admin.duplicateTitle') : t('admin.importedTitle'),
        message: result.duplicate
          ? t('admin.duplicateMessage', { title: result.manga.title })
          : t('admin.importedMessage', { title: result.manga.title }),
      })

      setImportCandidate(null)
      if (activePreset) {
        void runPreset(activePreset, {
          page: pagination?.currentPage || 1,
          limit: pageSize,
        })
        return
      }

      if (currentRequest.mode === 'search' && currentRequest.params) {
        void runSearch(filters, pagination?.currentPage || 1, pageSize)
      }
    } catch (importError) {
      notify({
        variant: 'error',
        title: t('admin.importFailedTitle'),
        message: importError.message || t('admin.importFailedMessage'),
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handlePageSizeChange = (event) => {
    const nextPageSize = Number.parseInt(event.target.value, 10) || DEFAULT_PAGE_SIZE
    setPageSize(nextPageSize)

    if (activePreset) {
      void runPreset(activePreset, { page: 1, limit: nextPageSize })
      return
    }

    if (currentRequest.mode === 'search' && currentRequest.params) {
      void runSearch(filters, 1, nextPageSize)
      return
    }

    void runPreset('popular', { page: 1, limit: nextPageSize })
  }

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage === pagination?.currentPage) {
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (activePreset) {
      void runPreset(activePreset, { page: nextPage, limit: pageSize })
      return
    }

    void runSearch(filters, nextPage, pageSize)
  }

  const resultCountLabel = pagination?.total
    ? t('common.resultsVisible', { visible: results.length, total: pagination.total })
    : t('common.resultsVisibleFallback', { visible: results.length })

  const paginationLabel = pagination?.lastVisiblePage
    ? t('admin.pageText', { current: pagination.currentPage, total: pagination.lastVisiblePage })
    : null

  return (
    <section className="external-browser">
      <div className="external-browser-header">
        <div>
          <span className="external-browser-kicker">Jikan + MyAnimeList</span>
          <h3>{t('admin.externalSearchTitle')}</h3>
          <p>{t('admin.externalSearchSubtitle')}</p>
        </div>
      </div>

      <form className="external-browser-searchbar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={filters.q}
          onChange={(event) => updateFilter('q', event.target.value)}
          placeholder={t('admin.externalSearchPlaceholder')}
          className="external-browser-input search"
        />
        <button type="submit" className="external-browser-btn primary" disabled={isLoading}>
          {isLoading ? t('admin.searching') : t('common.search')}
        </button>
      </form>

      <div className="external-browser-filters">
        <select
          value={filters.genre}
          onChange={(event) => updateFilter('genre', event.target.value)}
          className="external-browser-input"
        >
          <option value="">{t('admin.allGenres')}</option>
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
          {statusOptions.map((status) => (
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
          {typeOptions.map((type) => (
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
          {orderOptions.map((order) => (
            <option key={order.value} value={order.value}>
              {t('admin.orderBy', { value: order.label })}
            </option>
          ))}
        </select>

        <select
          value={filters.sort}
          onChange={(event) => updateFilter('sort', event.target.value)}
          className="external-browser-input"
        >
          <option value="asc">{t('admin.ascending')}</option>
          <option value="desc">{t('admin.descending')}</option>
        </select>

        <input
          type="number"
          min="1900"
          max="2100"
          placeholder={t('admin.yearPlaceholder')}
          value={filters.year}
          onChange={(event) => updateFilter('year', event.target.value)}
          className="external-browser-input"
        />

        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          placeholder={t('admin.minScorePlaceholder')}
          value={filters.minScore}
          onChange={(event) => updateFilter('minScore', event.target.value)}
          className="external-browser-input"
        />
      </div>

      <div className="external-browser-toolbar">
        <div className="external-browser-presets">
          {presetActions.map((preset) => (
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

        <div className="external-browser-toolbar-actions">
          <label className="external-browser-page-size">
            <span>{t('admin.resultsPageSize')}</span>
            <select value={pageSize} onChange={handlePageSizeChange} className="external-browser-input">
              {RESULTS_PER_PAGE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </label>

          <button type="button" className="external-browser-btn subtle" onClick={handleResetFilters} disabled={isLoading}>
            {t('common.resetFilters')}
          </button>
        </div>
      </div>

      <div className="external-browser-results-header">
        <div>
          <h4>{getResultsTitle()}</h4>
          <p>{resultCountLabel}</p>
        </div>
        {paginationLabel ? <p className="external-browser-results-page">{paginationLabel}</p> : null}
      </div>

      {error ? <p className="external-browser-error">{error}</p> : null}

      {isBootstrapping ? (
        <div className="external-browser-empty">
          <strong>{t('admin.externalLoadingTitle')}</strong>
          <span>{t('admin.externalLoadingMessage')}</span>
        </div>
      ) : null}

      {!isBootstrapping && !isLoading && results.length === 0 ? (
        <div className="external-browser-empty">
          <strong>{t('admin.noResultsTitle')}</strong>
          <span>{t('admin.noResultsMessage')}</span>
        </div>
      ) : null}

      {results.length > 0 ? (
        <>
        <div className="external-browser-grid">
          {results.map((manga) => (
            <ExternalResultCard
              key={manga.externalId}
              manga={manga}
              onOpenDetail={handleOpenDetail}
              onOpenImport={handleOpenImport}
              onPrefill={handlePrefill}
              t={t}
              locale={locale}
              formatStatusLabel={formatStatusLabel}
            />
          ))}
        </div>
        <div className="external-browser-pagination">
          <button
            type="button"
            className="external-browser-btn subtle"
            onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
            disabled={isLoading || (pagination?.currentPage || 1) <= 1}
          >
            {t('common.previousPage')}
          </button>

          {paginationLabel ? <span>{paginationLabel}</span> : null}

          <button
            type="button"
            className="external-browser-btn subtle"
            onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
            disabled={isLoading || !pagination?.hasNextPage}
          >
            {t('common.nextPage')}
          </button>
        </div>
        </>
      ) : null}

      {detailManga ? (
        <div className="admin-modal-overlay" onClick={handleCloseDetail}>
          <div className="admin-modal-panel external-detail-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="admin-modal-close" onClick={handleCloseDetail} disabled={isDetailLoading}>
              ×
            </button>

            {isDetailLoading ? (
              <div className="external-detail-loading">
                <strong>{t('common.loading')}</strong>
                <span>Jikan + MyAnimeList</span>
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
                    <span className="external-browser-kicker">{t('admin.externalDetailKicker')}</span>
                    <h3>{detailManga.title}</h3>
                    <p>{detailManga.titleEnglish || detailManga.titleJapanese || detailManga.type || t('common.manga')}</p>

                    <div className="external-detail-stats">
                      <span>{t('common.score')} {formatMetric(detailManga.score, { fallback: t('common.notAvailable') })}</span>
                      <span>{t('admin.rankLabel', { value: formatMetric(detailManga.rank, { fallback: t('common.notAvailable') }) })}</span>
                      <span>{t('admin.popularityLabel', { value: formatMetric(detailManga.popularity, { fallback: t('common.notAvailable') }) })}</span>
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
                    <h4>{t('admin.alternateTitles')}</h4>
                    <ul className="external-detail-list">
                      <li>{t('admin.englishTitle')}: {detailManga.titleEnglish || t('common.notAvailable')}</li>
                      <li>{t('admin.japaneseTitle')}: {detailManga.titleJapanese || t('common.notAvailable')}</li>
                      <li>{t('admin.synonyms')}: {detailManga.titleSynonyms?.join(', ') || t('common.notAvailable')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4>{t('admin.dataSheet')}</h4>
                    <ul className="external-detail-list">
                      <li>{t('common.status')}: {formatStatusLabel(detailManga.status)}</li>
                      <li>{t('common.type')}: {detailManga.type || t('common.notAvailable')}</li>
                      <li>{t('common.chapters')}: {formatMetric(detailManga.chapters, { fallback: t('common.notAvailable') })}</li>
                      <li>{t('common.volumes')}: {formatMetric(detailManga.volumes, { fallback: t('common.notAvailable') })}</li>
                      <li>{t('admin.publishedFrom')}: {detailManga.publishedFrom ? new Date(detailManga.publishedFrom).toLocaleDateString(locale) : t('common.notAvailable')}</li>
                      <li>{t('admin.publishedTo')}: {detailManga.publishedTo ? new Date(detailManga.publishedTo).toLocaleDateString(locale) : t('common.notAvailable')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4>{t('admin.authorsTitle')}</h4>
                    <ul className="external-detail-list">
                      {detailManga.authors?.length ? (
                        detailManga.authors.map((author) => (
                          <li key={author}>{author}</li>
                        ))
                      ) : (
                        <li>{t('admin.noAuthors')}</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="external-detail-copy">
                  <h4>{t('common.synopsis')}</h4>
                  <p>{detailManga.synopsis || t('admin.noSynopsis')}</p>
                </div>

                <div className="external-detail-actions">
                  <button type="button" className="external-browser-btn secondary" onClick={() => handlePrefill(detailManga)}>
                    {t('common.editInForm')}
                  </button>
                  <button type="button" className="external-browser-btn primary" onClick={() => handleOpenImport(detailManga)}>
                    {t('common.import')}
                  </button>
                  {detailManga.url ? (
                    <a href={detailManga.url} target="_blank" rel="noreferrer" className="external-browser-link">
                      {t('admin.viewOnMal')}
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

            <span className="external-browser-kicker">{t('admin.importConfirmKicker')}</span>
            <h3>{importCandidate.title}</h3>
            <p>{t('admin.confirmImportMessage')}</p>

            <div className="import-decision-summary">
              <span>{t('common.score')} {formatMetric(importCandidate.score, { fallback: t('common.notAvailable') })}</span>
              <span>{formatStatusLabel(importCandidate.status)}</span>
              <span>{t('admin.followersCount', { count: formatCompactNumber(importCandidate.members, locale, t('common.notAvailable')) })}</span>
            </div>

            <div className="import-decision-actions">
              <button
                type="button"
                className="external-browser-btn subtle"
                onClick={handleCloseImport}
                disabled={isImporting}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="external-browser-btn secondary"
                onClick={() => handlePrefill(importCandidate)}
                disabled={isImporting}
              >
                {t('admin.editBeforeSaving')}
              </button>
              <button
                type="button"
                className="external-browser-btn primary"
                onClick={handleImportNow}
                disabled={isImporting}
              >
                {isImporting ? t('admin.importing') : t('admin.import')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ExternalMangaSearch
