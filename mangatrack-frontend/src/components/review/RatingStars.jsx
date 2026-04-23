function RatingStars({ rating }) {
  return (
    <div className="rating-stars" aria-label={`Puntuacion ${rating} de 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < Number(rating || 0)

        return (
          <span key={index} className={isFilled ? 'star-filled' : 'star-empty'}>
            ★
          </span>
        )
      })}
    </div>
  )
}

export default RatingStars
