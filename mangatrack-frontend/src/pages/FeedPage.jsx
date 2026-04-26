import { useEffect, useState } from 'react'

import ActivityFeedList from '../components/activity/ActivityFeedList.jsx'
import useI18n from '../hooks/useI18n.js'
import activityService from '../services/activityService.js'

function FeedPage() {
  const { t } = useI18n()
  const [activities, setActivities] = useState([])
  const [meta, setMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadFeed = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await activityService.getFeed({ limit: 20 })

        if (!isMounted) {
          return
        }

        setActivities(response.items || [])
        setMeta(response.meta || null)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError.message || 'No se pudo cargar el feed.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadFeed()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>{t('feed.title')}</h1>
          <p>{t('feed.subtitle')}</p>
          {meta?.total ? <p className="list-summary">{t('feed.registeredEvents', { total: meta.total })}</p> : null}
        </div>
      </section>

      <div className="figma-content">
        {isLoading ? (
          <div className="empty-state">
            <span className="empty-state-icon">⌛</span>
            <h2>{t('feed.loadingTitle')}</h2>
            <p>{t('feed.loadingMessage')}</p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="empty-state">
            <span className="empty-state-icon">!</span>
            <h2>{t('feed.errorTitle')}</h2>
            <p>{error}</p>
          </div>
        ) : null}

        {!isLoading && !error ? (
          <ActivityFeedList
            title={t('feed.globalTimeline')}
            activities={activities}
            emptyTitle={t('feed.emptyTitle')}
            emptyMessage={t('feed.emptyMessage')}
          />
        ) : null}
      </div>
    </div>
  )
}

export default FeedPage
