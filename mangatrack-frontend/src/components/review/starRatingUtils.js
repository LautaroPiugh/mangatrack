export const clampRating = (value, max = 5) => {
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.min(Math.max(Math.round(numericValue * 2) / 2, 0), max)
}

export const getStarFillLevel = (value, star) => {
  const normalizedValue = clampRating(value, star)
  return Math.max(0, Math.min(1, normalizedValue - (star - 1)))
}

export const formatRatingValue = (value) => {
  const normalizedValue = clampRating(value)

  if (normalizedValue === 0) {
    return '0'
  }

  return Number.isInteger(normalizedValue) ? `${normalizedValue}` : normalizedValue.toFixed(1)
}

export const getPointerRating = (event, star) => {
  const bounds = event.currentTarget.getBoundingClientRect()

  if (!bounds.width) {
    return star
  }

  const offsetX = event.clientX - bounds.left
  return offsetX <= bounds.width / 2 ? star - 0.5 : star
}

export const getToggledRating = (currentValue, rawValue, star) => {
  const normalizedCurrent = clampRating(currentValue)
  const normalizedRaw = clampRating(rawValue)
  const fullValue = star
  const halfValue = star - 0.5

  if (normalizedRaw === fullValue && normalizedCurrent === fullValue) {
    return halfValue
  }

  if (normalizedRaw === halfValue && normalizedCurrent === halfValue) {
    return fullValue
  }

  return normalizedRaw
}
