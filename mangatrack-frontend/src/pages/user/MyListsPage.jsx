import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import MangaListForm from '../../components/user/MangaListForm.jsx'
import UserListsSection from '../../components/user/UserListsSection.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import listService from '../../services/listService.js'

function MyListsPage() {
  const { notify } = useFeedback()
  const { t } = useI18n()
  const [lists, setLists] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingList, setEditingList] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadLists = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await listService.getMyLists()

        if (!isMounted) {
          return
        }

        setLists(response.items || [])
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || t('myLists.loadErrorTitle'))
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
  }, [t])

  const handleSubmit = async (payload) => {
    setIsSaving(true)

    try {
      const savedList = editingList
        ? await listService.updateList(editingList._id || editingList.id, payload)
        : await listService.createList(payload)

      setLists((current) => {
        const currentId = savedList._id || savedList.id
        const filtered = current.filter((item) => (item._id || item.id) !== currentId)
        return [savedList, ...filtered]
      })

      setEditingList(null)
      setIsCreating(false)

      notify({
        variant: 'success',
        title: editingList ? t('notifications.listUpdatedTitle') : t('notifications.listCreatedTitle'),
        message: t('notifications.listSavedMessage', { title: savedList.title }),
      })
    } catch (saveError) {
      notify({
        variant: 'error',
        title: t('notifications.listSaveErrorTitle'),
        message: saveError.message || t('notifications.tryAgainMessage'),
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (list) => {
    const listId = list._id || list.id
    setDeletingId(listId)

    try {
      await listService.deleteList(listId)
      setLists((current) => current.filter((item) => (item._id || item.id) !== listId))

      notify({
        variant: 'success',
        title: t('notifications.listDeletedTitle'),
        message: t('notifications.listDeletedMessage', { title: list.title }),
      })
    } catch (deleteError) {
      notify({
        variant: 'error',
        title: t('notifications.listDeleteErrorTitle'),
        message: deleteError.message || t('notifications.tryAgainMessage'),
      })
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>{t('myLists.title')}</h1>
          <p>{t('myLists.subtitle')}</p>
        </div>

        <div className="list-header-actions">
          <button
            type="button"
            className="primary-action"
            onClick={() => {
              setEditingList(null)
              setIsCreating((current) => !current)
            }}
          >
            {isCreating ? t('myLists.closeForm') : t('myLists.newList')}
          </button>
        </div>
      </section>

      <div className="figma-content">
        <div className="profile-layout">
          <div className="profile-main-column">
            {isLoading ? (
              <div className="empty-state">
                <span className="empty-state-icon">⌛</span>
                <h2>{t('myLists.loadingTitle')}</h2>
                <p>{t('myLists.loadingMessage')}</p>
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="empty-state">
                <span className="empty-state-icon">!</span>
                <h2>{t('myLists.loadErrorTitle')}</h2>
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && !error ? (
              <UserListsSection
                title={t('myLists.sectionTitle')}
                lists={lists}
                emptyTitle={t('myLists.emptyTitle')}
                emptyMessage={t('myLists.emptyMessage')}
                actionsByList={(list) => (
                  <>
                    <button
                      type="button"
                      className="review-inline-action"
                      onClick={() => {
                        setEditingList(list)
                        setIsCreating(true)
                      }}
                    >
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="review-inline-action"
                      onClick={() => handleDelete(list)}
                      disabled={deletingId === (list._id || list.id)}
                    >
                      {deletingId === (list._id || list.id) ? t('myLists.deleting') : t('common.delete')}
                    </button>
                    <Link className="review-inline-link" to={`/lists/${list._id || list.id}`}>
                      {t('common.open')}
                    </Link>
                  </>
                )}
              />
            ) : null}
          </div>

          <aside className="profile-side-column">
            {(isCreating || editingList) ? (
              <section className="figma-section profile-form-panel">
                <div className="section-title">
                  <span>☰</span>
                  <h2>{editingList ? t('myLists.editList') : t('myLists.newListTitle')}</h2>
                </div>

                <MangaListForm
                  key={editingList?._id || editingList?.id || 'new-list'}
                  initialData={editingList || {}}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setEditingList(null)
                    setIsCreating(false)
                  }}
                  isLoading={isSaving}
                  submitLabel={editingList ? t('myLists.saveChanges') : t('myLists.createList')}
                />
              </section>
            ) : (
              <section className="figma-section profile-form-panel">
                <div className="section-title">
                  <span>Tip</span>
                  <h2>{t('myLists.tipsTitle')}</h2>
                </div>

                <div className="profile-tip-stack">
                  <p>{t('myLists.tipsVisibility')}</p>
                  <p>{t('myLists.tipsAddManga')}</p>
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

export default MyListsPage
