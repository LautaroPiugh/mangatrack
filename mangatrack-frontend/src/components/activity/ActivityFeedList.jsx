import { Link } from 'react-router-dom'

import useI18n from '../../hooks/useI18n.js'
import { formatRelativeDate } from '../../utils/date.js'
import UserAvatar from '../user/UserAvatar.jsx'

const getUserName = (activity, fallbackLabel) => (
  activity.user?.displayName
  || activity.user?.username
  || activity.user?.name
  || fallbackLabel
)

const ActivityTarget = ({ activity, t }) => {
  switch (activity.type) {
    case 'review_created':
    case 'manga_favorited':
    case 'manga_added_to_watchlist':
    case 'manga_added_to_list':
      return activity.manga?.slug
        ? <Link to={`/mangas/${activity.manga.slug}`}>{activity.manga.title}</Link>
        : <span>{activity.manga?.title || t('activity.mangaFallback')}</span>
    case 'list_created':
      return activity.user?.username && activity.list?._id
        ? <Link to={`/users/${activity.user.username}/lists/${activity.list._id}`}>{activity.list.title}</Link>
        : <span>{activity.list?.title || t('activity.listFallback')}</span>
    default:
      return <span>{t('activity.activityFallback')}</span>
  }
}

const getActionPrefix = (type, t) => {
  switch (type) {
    case 'review_created':
      return t('activity.reviewCreated')
    case 'manga_favorited':
      return t('activity.mangaFavorited')
    case 'manga_added_to_watchlist':
      return t('activity.mangaAddedToWatchlist')
    case 'manga_added_to_list':
      return t('activity.mangaAddedToList')
    case 'list_created':
      return t('activity.listCreated')
    default:
      return t('activity.didSomethingWith')
  }
}

function ActivityFeedList({
  title = '',
  activities = [],
  emptyTitle = '',
  emptyMessage = '',
  sectionClassName = '',
  timelineClassName = '',
}) {
  const sectionClasses = ['figma-section', sectionClassName].filter(Boolean).join(' ')
  const timelineClasses = ['activity-timeline', timelineClassName].filter(Boolean).join(' ')
  const { t } = useI18n()
  const fallbackUserLabel = t('activity.userFallback')

  return (
    <section className={sectionClasses}>
      <div className="section-title">
        <span>↻</span>
        <h2>{title || t('activity.title')}</h2>
      </div>

      {activities.length ? (
        <div className={timelineClasses}>
          {activities.map((activity) => (
            <article key={activity._id || activity.id} className="activity-card">
              <div className="activity-avatar">
                <UserAvatar user={activity.user} size={36} />
              </div>

              <div className="activity-copy">
                <p>
                  {activity.user?.username ? (
                    <Link to={`/users/${activity.user.username}`}>{getUserName(activity, fallbackUserLabel)}</Link>
                  ) : (
                    <span>{getUserName(activity, fallbackUserLabel)}</span>
                  )}{' '}
                  {getActionPrefix(activity.type, t)}{' '}
                  <ActivityTarget activity={activity} t={t} />
                  {activity.type === 'manga_added_to_list' && activity.list?.title ? (
                    <>
                      {' '}{t('activity.inList')}{' '}
                      {activity.user?.username ? (
                        <Link to={`/users/${activity.user.username}/lists/${activity.list._id}`}>{activity.list.title}</Link>
                      ) : (
                        <span>{activity.list.title}</span>
                      )}
                    </>
                  ) : null}
                </p>
                <time>{formatRelativeDate(activity.createdAt)}</time>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">↻</span>
          <h2>{emptyTitle || t('activity.emptyTitle')}</h2>
          <p>{emptyMessage || t('activity.emptyMessage')}</p>
        </div>
      )}
    </section>
  )
}

export default ActivityFeedList
