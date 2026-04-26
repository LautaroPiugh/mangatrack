import { useMemo, useState } from 'react'

import StarRatingDisplay from './StarRatingDisplay.jsx'
import { clampRating, formatRatingValue, getPointerRating, getToggledRating } from './starRatingUtils.js'

function StarRatingInput({
  value = 0,
  onChange,
  max = 5,
  disabled = false,
  size = 'md',
  ariaLabel = 'Seleccionar rating',
}) {
  const normalizedValue = clampRating(value, max)
  const [hoverValue, setHoverValue] = useState(null)
  const displayValue = hoverValue ?? normalizedValue

  const buttonLabels = useMemo(
    () => Array.from({ length: max }, (_, index) => `Calificar con ${index + 1} estrellas`),
    [max],
  )

  const commitValue = (nextValue) => {
    if (disabled) {
      return
    }

    onChange?.(clampRating(nextValue, max))
  }

  const handlePointerMove = (event, star) => {
    if (disabled) {
      return
    }

    setHoverValue(clampRating(getPointerRating(event, star), max))
  }

  const handlePointerLeave = () => {
    setHoverValue(null)
  }

  const handleClick = (event, star) => {
    const rawValue = getPointerRating(event, star)
    const nextValue = getToggledRating(normalizedValue, rawValue, star)
    commitValue(nextValue)
    setHoverValue(nextValue)
  }

  const handleKeyDown = (event, star) => {
    if (disabled) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const nextValue = getToggledRating(normalizedValue, star, star)
      commitValue(nextValue)
      setHoverValue(nextValue)
      return
    }

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      commitValue(normalizedValue + 0.5)
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      commitValue(normalizedValue - 0.5)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      commitValue(0.5)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      commitValue(max)
    }
  }

  return (
    <div className={`star-rating-input star-rating-${size}`} onMouseLeave={handlePointerLeave}>
      <div className="star-rating-track" role="group" aria-label={ariaLabel}>
        {Array.from({ length: max }, (_, index) => {
          const star = index + 1
          const isCurrentTarget = displayValue >= star - 0.5 && displayValue <= star

          return (
            <button
              key={star}
              type="button"
              className={`star-rating-button ${isCurrentTarget ? 'is-current' : ''}`}
              onMouseMove={(event) => handlePointerMove(event, star)}
              onClick={(event) => handleClick(event, star)}
              onKeyDown={(event) => handleKeyDown(event, star)}
              disabled={disabled}
              aria-label={buttonLabels[index]}
              aria-pressed={normalizedValue === star || normalizedValue === star - 0.5}
            >
              <StarRatingDisplay
                value={displayValue >= star ? 1 : displayValue >= star - 0.5 ? 0.5 : 0}
                max={1}
                size={size}
                decorative
              />
            </button>
          )
        })}
      </div>

      <span className="star-rating-value" aria-live="polite">
        {formatRatingValue(displayValue)} / {max}
      </span>
    </div>
  )
}

export default StarRatingInput
