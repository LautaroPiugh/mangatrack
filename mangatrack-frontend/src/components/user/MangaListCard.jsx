import { Link } from 'react-router-dom'

import useI18n from '../../hooks/useI18n.js'

const buildListHref = (list, username = '') => (
  username ? `/users/${username}/lists/${list._id || list.id}` : `/lists/${list._id || list.id}`
)

function MangaListCard({ list, username = '', actions = null, variant = 'default' }) {
  const { language, t } = useI18n()
  const locale = language === 'en' ? 'en-US' : 'es-AR'
  const covers = (list.items || [])
    .slice(0, 4)
    .map((item) => item.manga?.coverUrl || item.manga?.coverImage || null)
  const updatedAt = list.updatedAt || list.createdAt
  const cardClassName = ['manga-list-card', variant !== 'default' ? `manga-list-card-${variant}` : ''].filter(Boolean).join(' ')
  const mangaCount = list.items?.length || 0

  return (
    <article className={cardClassName}>
      <Link className="manga-list-card-link" to={buildListHref(list, username)}>
        <div className="manga-list-collage">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`${list._id || list.id}-cover-${index}`} className="manga-list-collage-slot">
              {covers[index] ? (
                <img src={covers[index]} alt={list.title} />
              ) : (
                <span>{index === 0 ? t('common.manga').slice(0, 1) : ''}</span>
              )}
            </div>
          ))}
        </div>

        <div className="manga-list-card-copy">
          <div className="manga-list-card-head">
            <div>
              <h3>{list.title}</h3>
              <p>{list.description || t('lists.noDescription')}</p>
            </div>
            <span className={`manga-list-visibility ${list.visibility === 'public' ? 'public' : 'private'}`}>
              {list.visibility === 'public' ? t('lists.public') : t('lists.private')}
            </span>
          </div>

          <div className="manga-list-card-meta">
            <span>{t(mangaCount === 1 ? 'lists.mangaCountSingular' : 'lists.mangaCountPlural', { count: mangaCount })}</span>
            <span>{updatedAt ? t('lists.updatedAt', { date: new Date(updatedAt).toLocaleDateString(locale) }) : t('lists.noDate')}</span>
          </div>
        </div>
      </Link>

      {actions ? <div className="manga-list-card-actions">{actions}</div> : null}
    </article>
  )
}

export default MangaListCard
