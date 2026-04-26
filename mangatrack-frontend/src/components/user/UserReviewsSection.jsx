import ReviewCard from '../review/ReviewCard.jsx'
import useI18n from '../../hooks/useI18n.js'

function UserReviewsSection({
  title = '',
  reviews = [],
  emptyTitle = '',
  emptyMessage = '',
  sectionClassName = '',
  listClassName = '',
}) {
  const { t } = useI18n()
  const sectionClasses = ['figma-section', sectionClassName].filter(Boolean).join(' ')
  const listClasses = ['review-list', 'review-list-wide', listClassName].filter(Boolean).join(' ')

  return (
    <section className={sectionClasses}>
      <div className="section-title">
        <span>★</span>
        <h2>{title || t('publicProfile.recentReviews')}</h2>
      </div>

      {reviews.length ? (
        <div className={listClasses}>
          {reviews.map((review) => (
            <ReviewCard key={review._id || review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">★</span>
          <h2>{emptyTitle || t('publicProfile.reviewsEmptyTitle')}</h2>
          <p>{emptyMessage || t('publicProfile.reviewsEmptyMessage')}</p>
        </div>
      )}
    </section>
  )
}

export default UserReviewsSection
