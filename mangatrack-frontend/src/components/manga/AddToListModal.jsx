import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import useI18n from '../../hooks/useI18n.js'
import listService from '../../services/listService.js'

function AddToListModal({ isOpen, manga, onClose, onAdded }) {
  const { t } = useI18n()
  const [lists, setLists] = useState([])
  const [selectedListId, setSelectedListId] = useState('')
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    let isMounted = true

    const loadLists = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const response = await listService.getMyLists()

        if (!isMounted) {
          return
        }

        setLists(response.items || [])
        setSelectedListId(response.items?.[0]?._id || response.items?.[0]?.id || '')
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setLoadError(loadError.message || t('addToList.loadErrorMessage'))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadLists()

    return () => {
      isMounted = false
    }
  }, [isOpen, t])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedListId || !manga?._id) {
      return
    }

    setIsSaving(true)
    setSubmitError('')

    try {
      const updatedList = await listService.addItemToList(selectedListId, {
        mangaId: manga._id,
        note,
      })

      onAdded?.(updatedList)
      setNote('')
    } catch (saveError) {
      setSubmitError(saveError.message || t('addToList.submitErrorMessage'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-panel add-to-list-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="admin-modal-close" onClick={onClose} disabled={isSaving}>
          ×
        </button>

        <span className="external-browser-kicker">{t('addToList.title')}</span>
        <h3>{manga?.title}</h3>
        <p>{t('addToList.subtitle')}</p>

        {isLoading ? (
          <div className="external-browser-empty">
            <strong>{t('addToList.loadingTitle')}</strong>
            <span>{t('addToList.loadingMessage')}</span>
          </div>
        ) : null}

        {!isLoading && loadError ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>{t('addToList.loadErrorTitle')}</h2>
            <p>{loadError}</p>
          </div>
        ) : null}

        {!isLoading && !loadError && !lists.length ? (
          <div className="empty-state">
            <span className="empty-state-icon">☰</span>
            <h2>{t('addToList.emptyTitle')}</h2>
            <p>{t('addToList.emptyMessage')}</p>
            <Link className="primary-action" to="/lists">{t('addToList.goToLists')}</Link>
          </div>
        ) : null}

        {!isLoading && !loadError && lists.length ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('addToList.listLabel')}</span>
              <select value={selectedListId} onChange={(event) => setSelectedListId(event.target.value)}>
                {lists.map((list) => (
                  <option key={list._id || list.id} value={list._id || list.id}>
                    {list.title} ({list.visibility === 'public' ? t('lists.public') : t('lists.private')})
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{t('addToList.noteLabel')}</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                maxLength={280}
                placeholder={t('addToList.notePlaceholder')}
              />
            </label>

            <div className="profile-form-actions">
              <button type="button" className="filter-pill" onClick={onClose} disabled={isSaving}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="primary-action" disabled={isSaving || !selectedListId}>
                {isSaving ? t('common.adding') : t('addToList.submit')}
              </button>
            </div>

            {submitError ? <p className="auth-feedback auth-feedback-error">{submitError}</p> : null}
          </form>
        ) : null}
      </div>
    </div>
  )
}

export default AddToListModal
