import { Link } from 'react-router-dom'

import useI18n from '../../hooks/useI18n.js'
import { formatRelativeDate } from '../../utils/date.js'
import StarRatingDisplay from './StarRatingDisplay.jsx'
import UserAvatar from '../user/UserAvatar.jsx'

function ReviewCard({ review, actions = null }) {
  const { t } = useI18n()
  const user = review.user?.displayName || review.user?.username || review.user?.name || review.user || t('reviews.userFallback')
  const username = review.user?.username || ''
  const manga = review.manga?.title || review.manga || t('reviews.mangaFallback')
  const mangaSlug = review.manga?.slug || ''
  const rating = review.rating || 0
  const content = review.content || review.comment || ''
  const date = review.date || formatRelativeDate(review.createdAt || review.updatedAt)

  return (
    <article className="figma-review-card">
      <div className="figma-review-avatar">
        <UserAvatar user={review.user} size={48} />
      </div>

      <div className="figma-review-content">
        <div className="figma-review-head">
          <div>
            <h3>
              {username ? <Link className="review-user-link" to={`/users/${username}`}>{user}</Link> : user}
            </h3>
            <p>
              {t('reviews.reviewOf')}{' '}
              {mangaSlug ? <Link className="review-user-link" to={`/mangas/${mangaSlug}`}>{manga}</Link> : <span>{manga}</span>}
            </p>
          </div>
          <div className="figma-review-meta">
            <time>{date}</time>
            {actions ? <div className="figma-review-actions">{actions}</div> : null}
          </div>
        </div>

        <div className="figma-review-stars">
          <StarRatingDisplay value={rating} size="sm" />
          <span className="figma-review-rating-value">{Number(rating).toFixed(1)}</span>
        </div>

        {content ? <p className="figma-review-comment">{content}</p> : null}
      </div>
    </article>
  )
}

export default ReviewCard
