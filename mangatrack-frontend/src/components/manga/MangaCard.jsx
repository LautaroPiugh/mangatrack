import { useState } from 'react'

import ImageWithFallback from '../common/ImageWithFallback.jsx'

function MangaCard({ manga }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const rating = manga.rating ?? manga.reviewSummary?.averageRating ?? 0
  const votes = manga.votes ?? manga.reviewSummary?.totalReviews ?? 0
  const cover = manga.cover || manga.coverImage

  return (
    <article className="figma-manga-card">
      <div className="figma-poster">
        <ImageWithFallback
          src={cover}
          alt={manga.title}
          className="figma-poster-image"
          loading="lazy"
        />

        {rating ? (
          <div className="figma-rating-badge">
            <span>★</span>
            {Number(rating).toFixed(1)}
          </div>
        ) : null}

        <div className="figma-poster-overlay">
          <div className="figma-actions">
            <button
              type="button"
              className={isFavorite ? 'figma-action figma-action-active' : 'figma-action'}
              onClick={() => setIsFavorite((current) => !current)}
              aria-label="Favorito"
            >
              ♥
            </button>
            <button
              type="button"
              className={isPending ? 'figma-action figma-action-pending' : 'figma-action'}
              onClick={() => setIsPending((current) => !current)}
              aria-label="Pendiente"
            >
              ＋
            </button>
          </div>

          <div className="figma-stars" aria-label="Puntuar manga">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setUserRating(star)}
                className={star <= (hoverRating || userRating) ? 'figma-star figma-star-active' : 'figma-star'}
                aria-label={`${star} estrellas`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="figma-card-copy">
        <h3>{manga.title}</h3>
        <p>{votes ? `${Number(votes).toLocaleString('es-AR')} valoraciones` : manga.author || manga.genre || 'Manga'}</p>
      </div>
    </article>
  )
}

export default MangaCard
