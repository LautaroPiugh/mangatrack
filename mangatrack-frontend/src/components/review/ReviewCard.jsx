import { Link } from 'react-router-dom'

import { formatDate, formatDateTime } from '../../utils/formatters.js'
import RatingStars from './RatingStars.jsx'
import StatusBadge from './StatusBadge.jsx'

function ReviewCard({
  review,
  currentUserId,
  onDelete,
  deletingId,
  showManga = true,
  compact = false,
}) {
  const isOwner = currentUserId && review.user?._id === currentUserId

  return (
    <article className={`card review-card ${compact ? 'review-card-compact' : ''}`}>
      <div className="review-header">
        <div>
          <div className="review-rating-line">
            <RatingStars rating={review.rating} />
            <span className="review-rating-value">{review.rating}/5</span>
          </div>

          <div className="review-meta-line">
            <StatusBadge status={review.status} />
            <span>{formatDateTime(review.createdAt)}</span>
          </div>
        </div>

        {isOwner ? (
          <div className="inline-actions">
            <Link to={`/reviews/${review._id}/edit`} className="button button-ghost">
              Editar
            </Link>
            <button
              type="button"
              className="button button-danger"
              onClick={() => onDelete?.(review)}
              disabled={deletingId === review._id}
            >
              {deletingId === review._id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        ) : null}
      </div>

      {showManga && review.manga ? (
        <Link to={`/mangas/${review.manga._id}`} className="review-linked-title">
          {review.manga.title}
        </Link>
      ) : null}

      <p className="review-comment">{review.comment}</p>

      <div className="review-footer">
        <span>por {review.user?.name || 'Usuario'}</span>
        <span>{formatDate(review.updatedAt)}</span>
      </div>
    </article>
  )
}

export default ReviewCard
