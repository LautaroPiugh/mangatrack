import { clampRating, formatRatingValue, getStarFillLevel } from './starRatingUtils.js'

function StarGlyph({ fill = 0 }) {
  return (
    <span className="star-rating-glyph" style={{ '--star-fill': fill }} aria-hidden="true">
      <span className="star-rating-glyph-base">★</span>
      <span className="star-rating-glyph-fill">★</span>
    </span>
  )
}

function StarRatingDisplay({
  value = 0,
  max = 5,
  size = 'md',
  className = '',
  ariaLabel = '',
  showValue = false,
  decorative = false,
}) {
  const normalizedValue = clampRating(value, max)
  const classes = ['star-rating-display', `star-rating-${size}`, className].filter(Boolean).join(' ')
  const resolvedAriaLabel = ariaLabel || `${formatRatingValue(normalizedValue)} de ${max} estrellas`

  return (
    <div
      className={classes}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : resolvedAriaLabel}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <div className="star-rating-track" aria-hidden="true">
        {Array.from({ length: max }, (_, index) => {
          const star = index + 1
          return <StarGlyph key={star} fill={getStarFillLevel(normalizedValue, star)} />
        })}
      </div>

      {showValue ? (
        <span className="star-rating-value">{formatRatingValue(normalizedValue)}</span>
      ) : null}
    </div>
  )
}

export default StarRatingDisplay
