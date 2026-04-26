import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ExternalMangaSearch from '../../components/admin/ExternalMangaSearch.jsx'
import MangaForm from '../../components/admin/MangaForm.jsx'
import useI18n from '../../hooks/useI18n.js'
import mangaService from '../../services/mangaService.js'

function AdminMangaCreatePage() {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [mode, setMode] = useState('import')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedExternalData, setSelectedExternalData] = useState({})
  const [selectedFormVersion, setSelectedFormVersion] = useState(0)
  const [showImportHelp, setShowImportHelp] = useState(false)

  const hasExternalPrefill = Boolean(selectedExternalData?.title)
  const createModes = useMemo(() => ([
    {
      value: 'import',
      label: t('admin.searchAndImport'),
      description: t('admin.searchAndImportDescription'),
    },
    {
      value: 'manual',
      label: t('admin.createManually'),
      description: t('admin.createManuallyDescription'),
    },
  ]), [t])

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
      const errorMessage = err.message || t('notifications.tryAgainMessage')
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-manga-create-page">
      <div className="admin-create-hero">
        <div className="admin-page-header">
          <h1>{t('admin.newMangaTitle')}</h1>
          <p>{t('admin.newMangaSubtitle')}</p>
        </div>

        <div className="admin-create-mode-switch-section">
          <div className="admin-create-mode-switch" role="tablist" aria-label={t('admin.newMangaTitle')}>
            {createModes.map((item) => (
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

          <button
            type="button"
            className="admin-create-help-btn"
            aria-expanded={showImportHelp}
            onClick={() => setShowImportHelp((current) => !current)}
          >
            ?
            <span className="sr-only">{t('admin.importHelpButton')}</span>
          </button>
        </div>

        {showImportHelp ? (
          <div className="admin-create-help-panel">
            <div>
              <span className="admin-create-sidecard-kicker">{t('admin.recommendedFlow')}</span>
              <p>{t('admin.importReviewSaveMessage')}</p>
            </div>
            <div>
              <span className="admin-create-sidecard-kicker">{t('admin.importTipTitle')}</span>
              <p>{t('admin.importTipMessage')}</p>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="admin-error-message">
          <p>{error}</p>
        </div>
      ) : null}

      {mode === 'import' ? (
        <div className="admin-create-layout import-layout">
          <div className="admin-create-main">
            <div className="admin-create-import-summary">
              {hasExternalPrefill ? (
                <div className="admin-create-sidecard selected compact">
                  <span className="admin-create-sidecard-kicker">{t('admin.prefillReady')}</span>
                  <h3>{selectedExternalData.title}</h3>
                  <p>{selectedExternalData.titleEnglish || selectedExternalData.type || t('admin.importedDataPrepared')}</p>
                  <div className="admin-create-sidecard-actions">
                    <button type="button" className="admin-mangas-create-btn" onClick={() => setMode('manual')}>
                      {t('admin.openForm')}
                    </button>
                    <button type="button" className="admin-create-link-btn" onClick={handleClearPrefill}>
                      {t('admin.clearPrefill')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="admin-create-import-note">
                  <span>{t('admin.importTipMessage')}</span>
                </div>
              )}
            </div>

            <ExternalMangaSearch
              onUseData={handleUseExternalData}
              onSwitchToManual={() => setMode('manual')}
            />
          </div>
        </div>
      ) : (
        <div className="admin-create-manual-layout">
          <aside className="admin-create-sidebar">
            <div className="admin-create-sidecard">
              <span className="admin-create-sidecard-kicker">{t('admin.manualMode')}</span>
              <h3>{hasExternalPrefill ? t('admin.reviewPrefill') : t('admin.buildFromScratch')}</h3>
              <p>
                {hasExternalPrefill
                  ? t('admin.reviewPrefillMessage')
                  : t('admin.buildFromScratchMessage')}
              </p>
            </div>

            {hasExternalPrefill ? (
              <div className="admin-create-sidecard selected compact">
                <span className="admin-create-sidecard-kicker">{t('admin.source')}</span>
                <h3>{selectedExternalData.source?.toUpperCase() || t('admin.source')}</h3>
                <p>{selectedExternalData.url || t('admin.importedDataPrepared')}</p>
                <button type="button" className="admin-create-link-btn" onClick={() => setMode('import')}>
                  {t('admin.backToImport')}
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
              heading={hasExternalPrefill ? t('admin.reviewAndSave') : t('admin.createLocalManga')}
              description={hasExternalPrefill
                ? t('admin.reviewAndSaveDescription')
                : t('admin.createLocalMangaDescription')}
              submitLabel={t('admin.saveManga')}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMangaCreatePage
