function ReviewCard({ review }) {
  const user = review.user?.name || review.user || 'Usuario'
  const manga = review.manga?.title || review.manga || 'Manga'
  const rating = review.rating || 0
  const comment = review.comment || ''
  const date = review.date || 'Hace un momento'

  return (
    <article className="figma-review-card">
      <div className="figma-review-avatar">{user.slice(0, 1)}</div>

      <div className="figma-review-content">
        <div className="figma-review-head">
          <div>
            <h3>{user}</h3>
            <p>Reseña de <span>{manga}</span></p>
          </div>
          <time>{date}</time>
        </div>

        <div className="figma-review-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= rating ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>

        <p className="figma-review-comment">{comment}</p>
      </div>
    </article>
  )
}

export default ReviewCard
