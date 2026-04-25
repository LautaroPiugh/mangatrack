import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ExternalMangaSearch from '../../components/admin/ExternalMangaSearch.jsx'
import MangaForm from '../../components/admin/MangaForm.jsx'
import mangaService from '../../services/mangaService.js'

const CREATE_MODES = [
  {
    value: 'import',
    label: 'Buscar e importar',
    description: 'Explorá MyAnimeList con filtros avanzados y traé datos listos para usar.',
  },
  {
    value: 'manual',
    label: 'Crear manualmente',
    description: 'Completá toda la ficha desde cero o revisá una precarga antes de guardar.',
  },
]

function AdminMangaCreatePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('import')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedExternalData, setSelectedExternalData] = useState({})
  const [selectedFormVersion, setSelectedFormVersion] = useState(0)

  const hasExternalPrefill = Boolean(selectedExternalData?.title)

  const handleUseExternalData = (externalManga) => {
    setSelectedExternalData(externalManga)
    setSelectedFormVersion((currentVersion) => currentVersion + 1)
    setMode('manual')
    setError('')
  }

  const handleClearPrefill = () => {
    setSelectedExternalData({})
    setSelectedFormVersion((currentVersion) => currentVersion + 1)
  }

  const handleSubmit = async (payload) => {
    setIsLoading(true)
    setError('')

    try {
      await mangaService.createManga(payload)
      navigate('/admin/mangas')
    } catch (err) {
      const errorMessage = err.message || 'Error al crear manga'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-manga-create-page">
      <div className="admin-create-hero">
        <div className="admin-page-header">
          <h1>Nuevo manga</h1>
          <p>Elegí si querés importar desde MyAnimeList o construir la ficha a mano dentro de MangaTrack.</p>
        </div>

        <div className="admin-create-mode-switch" role="tablist" aria-label="Modo de creación">
          {CREATE_MODES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={mode === item.value}
              className={`admin-create-mode-btn ${mode === item.value ? 'active' : ''}`}
              onClick={() => setMode(item.value)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="admin-error-message">
          <p>{error}</p>
        </div>
      ) : null}

      {mode === 'import' ? (
        <div className="admin-create-layout immersive">
          <div className="admin-create-main">
            <ExternalMangaSearch
              onUseData={handleUseExternalData}
              onSwitchToManual={() => setMode('manual')}
            />
          </div>

          <aside className="admin-create-sidebar">
            <div className="admin-create-sidecard">
              <span className="admin-create-sidecard-kicker">Flujo recomendado</span>
              <h3>Importar, revisar y guardar</h3>
              <p>Podés traer los datos de un manga externo al formulario, ajustarlos y guardarlos cuando estés conforme.</p>
            </div>

            {hasExternalPrefill ? (
              <div className="admin-create-sidecard selected">
                <span className="admin-create-sidecard-kicker">Precarga lista</span>
                <h3>{selectedExternalData.title}</h3>
                <p>{selectedExternalData.titleEnglish || selectedExternalData.type || 'Ficha externa preparada para revisión manual.'}</p>
                <div className="admin-create-sidecard-actions">
                  <button type="button" className="admin-mangas-create-btn" onClick={() => setMode('manual')}>
                    Abrir formulario
                  </button>
                  <button type="button" className="admin-create-link-btn" onClick={handleClearPrefill}>
                    Limpiar precarga
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-create-sidecard muted">
                <span className="admin-create-sidecard-kicker">Tip</span>
                <h3>Usá el modo manual sólo si hace falta</h3>
                <p>La búsqueda externa ya trae título, autores, géneros, score, status y fechas para ahorrarte trabajo.</p>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="admin-create-manual-layout">
          <aside className="admin-create-sidebar">
            <div className="admin-create-sidecard">
              <span className="admin-create-sidecard-kicker">Modo manual</span>
              <h3>{hasExternalPrefill ? 'Revisá la precarga' : 'Construí la ficha desde cero'}</h3>
              <p>
                {hasExternalPrefill
                  ? 'Los campos ya fueron completados con datos externos. Revisalos y guardá cuando estés listo.'
                  : 'Completá la información base, la portada y el estado de publicación del manga.'}
              </p>
            </div>

            {hasExternalPrefill ? (
              <div className="admin-create-sidecard selected compact">
                <span className="admin-create-sidecard-kicker">Origen</span>
                <h3>{selectedExternalData.source?.toUpperCase() || 'Externo'}</h3>
                <p>{selectedExternalData.url || 'Datos importados a formulario.'}</p>
                <button type="button" className="admin-create-link-btn" onClick={() => setMode('import')}>
                  Volver a importar
                </button>
              </div>
            ) : null}
          </aside>

          <div className="admin-create-main">
            <MangaForm
              key={selectedFormVersion}
              initialData={selectedExternalData}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              heading={hasExternalPrefill ? 'Revisar y guardar manga' : 'Crear manga manualmente'}
              description={hasExternalPrefill
                ? 'Ajustá la ficha precargada antes de publicarla en el catálogo interno.'
                : 'Completá cada bloque del formulario para crear una entrada local de MangaTrack.'}
              submitLabel="Guardar manga"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMangaCreatePage
