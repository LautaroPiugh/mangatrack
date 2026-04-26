import MangaListCard from './MangaListCard.jsx'
import useI18n from '../../hooks/useI18n.js'

function UserListsSection({
  title = '',
  username = '',
  lists = [],
  emptyTitle = '',
  emptyMessage = '',
  actionsByList = null,
  sectionClassName = '',
  gridClassName = '',
  cardVariant = 'default',
}) {
  const { t } = useI18n()
  const sectionClasses = ['figma-section', sectionClassName].filter(Boolean).join(' ')
  const gridClasses = ['manga-list-grid', gridClassName].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses}>
      <div className="section-title">
        <span>☰</span>
        <h2>{title || t('nav.lists')}</h2>
      </div>

      {lists.length ? (
        <div className={gridClasses}>
          {lists.map((list) => (
            <MangaListCard
              key={list._id || list.id}
              list={list}
              username={username}
              actions={actionsByList ? actionsByList(list) : null}
              variant={cardVariant}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">☰</span>
          <h2>{emptyTitle || t('publicProfile.listsEmptyTitle')}</h2>
          <p>{emptyMessage || t('publicProfile.listsEmptyMessage')}</p>
        </div>
      )}
    </section>
  )
}

export default UserListsSection
