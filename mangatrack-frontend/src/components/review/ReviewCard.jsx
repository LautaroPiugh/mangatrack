const formatRelativeDate = (value) => {
  if (!value) {
    return 'Hace un momento'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Hace un momento'
  }

  const diffInMinutes = Math.max(Math.floor((Date.now() - date.getTime()) / 60000), 0)

  if (diffInMinutes < 1) {
    return 'Hace un momento'
  }

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)

  if (diffInHours < 24) {
    return `Hace ${diffInHours} h`
  }

  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays < 7) {
    return `Hace ${diffInDays} d`
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function ReviewCard({ review, actions = null }) {
  const user = review.user?.username || review.user?.name || review.user || 'Usuario'
  const manga = review.manga?.title || review.manga || 'Manga'
  const rating = review.rating || 0
  const content = review.content || review.comment || ''
  const date = review.date || formatRelativeDate(review.createdAt || review.updatedAt)

  return (
    <article className="figma-review-card">
      <div className="figma-review-avatar">{user.slice(0, 1)}</div>

      <div className="figma-review-content">
        <div className="figma-review-head">
          <div>
            <h3>{user}</h3>
            <p>Reseña de <span>{manga}</span></p>
          </div>
          <div className="figma-review-meta">
            <time>{date}</time>
            {actions ? <div className="figma-review-actions">{actions}</div> : null}
          </div>
        </div>

        <div className="figma-review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>

        {content ? <p className="figma-review-comment">{content}</p> : null}
      </div>
    </article>
  )
}

export default ReviewCard
