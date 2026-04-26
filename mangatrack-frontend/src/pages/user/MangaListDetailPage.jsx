import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ImageWithFallback from '../../components/common/ImageWithFallback.jsx'
import useAuth from '../../hooks/useAuth.js'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'
import listService from '../../services/listService.js'

function MangaListDetailPage() {
  const { id, username, listId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useFeedback()
  const { t } = useI18n()
  const [list, setList] = useState(null)
  const [owner, setOwner] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState('')
  const [error, setError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const resolvedListId = listId || id

  useEffect(() => {
    let isMounted = true

    const loadList = async () => {
      setIsLoading(true)
      setError('')

      try {
        if (username) {
          const response = await listService.getUserList(username, resolvedListId)

          if (!isMounted) {
            return
          }

          setList(response.list)
          setOwner(response.meta?.user || null)
        } else {
          const response = await listService.getList(resolvedListId)

          if (!isMounted) {
            return
          }

          setList(response)
          setOwner(response.owner || null)
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || t('mangaListDetail.loadErrorTitle'))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadList()

    return () => {
      isMounted = false
    }
  }, [resolvedListId, t, username])

  const canManage = useMemo(() => {
    const ownerUsername = owner?.username || list?.owner?.username || ''
    return Boolean(user?.username && ownerUsername && ownerUsername === user.username)
  }, [list?.owner?.username, owner?.username, user?.username])

  const handleRemoveItem = async (mangaId) => {
    if (!canManage) {
      return
    }

    setRemovingId(mangaId)

    try {
      const updatedList = await listService.removeItemFromList(resolvedListId, mangaId)
      setList(updatedList)
      notify({
        variant: 'success',
        title: t('mangaListDetail.removedItemTitle'),
        message: t('mangaListDetail.removedItemMessage'),
      })
    } catch (removeError) {
      notify({
        variant: 'error',
        title: t('mangaListDetail.removeItemErrorTitle'),
        message: removeError.message || t('notifications.tryAgainMessage'),
      })
    } finally {
      setRemovingId('')
    }
  }

  const handleDeleteList = async () => {
    setIsDeleting(true)

    try {
      await listService.deleteList(resolvedListId)
      notify({
        variant: 'success',
        title: t('notifications.listDeletedTitle'),
        message: t('notifications.listDeletedMessage', { title: list?.title || '' }),
      })
      navigate('/lists')
    } catch (deleteError) {
      notify({
        variant: 'error',
        title: t('notifications.listDeleteErrorTitle'),
        message: deleteError.message || t('notifications.tryAgainMessage'),
      })
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="figma-page">
        <div className="figma-content">
          <div className="empty-state">
            <span className="empty-state-icon">⌛</span>
            <h2>{t('mangaListDetail.loadingTitle')}</h2>
            <p>{t('mangaListDetail.loadingMessage')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !list) {
    return (
      <div className="figma-page">
        <div className="figma-content">
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>{t('mangaListDetail.loadErrorTitle')}</h2>
            <p>{error || t('mangaListDetail.unavailableMessage')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="figma-page">
      <div className="figma-content">
        <section className="manga-list-detail-hero">
          <div>
            <span className="external-browser-kicker">{t('mangaListDetail.kicker')}</span>
            <h1>{list.title}</h1>
            <p>{list.description || t('mangaListDetail.noDescription')}</p>

            <div className="manga-list-detail-meta">
              <span>{list.visibility === 'public' ? t('lists.public') : t('lists.private')}</span>
              <span>{t((list.items?.length || 0) === 1 ? 'lists.mangaCountSingular' : 'lists.mangaCountPlural', { count: list.items?.length || 0 })}</span>
              {owner?.username ? (
                <Link to={`/users/${owner.username}`}>{t('mangaListDetail.viewProfile', { username: owner.username })}</Link>
              ) : null}
            </div>

            {canManage ? (
              <div className="manga-list-detail-actions">
                <button
                  type="button"
                  className="review-inline-action action-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  {t('mangaListDetail.deleteList')}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {list.items?.length ? (
          <div className="manga-list-detail-grid">
            {list.items.map((item) => {
              const manga = item.manga || {}
              const mangaId = manga._id || manga.id

              return (
                <article key={mangaId} className="manga-list-item-card">
                  <Link className="manga-list-item-link" to={`/mangas/${manga.slug || mangaId}`}>
                    <ImageWithFallback
                      src={manga.coverUrl || manga.coverImage}
                      alt={manga.title}
                        className="manga-list-item-cover"
                        fallbackClassName="manga-list-item-cover"
                    />

                    <div className="manga-list-item-copy">
                      <div>
                        <h3>{manga.title}</h3>
                        <p>{manga.author || manga.artist || manga.genres?.[0] || t('common.manga')}</p>
                      </div>
                      {item.note ? <p className="manga-list-item-note">{item.note}</p> : null}
                    </div>
                  </Link>

                  {canManage ? (
                    <button
                      type="button"
                      className="review-inline-action"
                      onClick={() => handleRemoveItem(mangaId)}
                      disabled={removingId === mangaId}
                    >
                      {removingId === mangaId ? t('common.removing') : t('mangaListDetail.removeAction')}
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">本</span>
            <h2>{t('mangaListDetail.emptyTitle')}</h2>
            <p>{t('mangaListDetail.emptyMessage')}</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={t('confirmDialog.deleteListTitle')}
        description={t('confirmDialog.deleteListDescription')}
        confirmLabel={t('confirmDialog.deleteListConfirm')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        loading={isDeleting}
        onConfirm={handleDeleteList}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

export default MangaListDetailPage
