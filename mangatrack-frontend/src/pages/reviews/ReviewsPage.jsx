import ReviewCard from '../../components/review/ReviewCard.jsx'

const reviews = [
  {
    id: 1,
    user: 'Kenji',
    manga: 'Jujutsu Kaisen',
    rating: 5,
    comment: 'Una obra maestra del shonen moderno. Los combates están increíblemente coreografiados y cada personaje tiene un desarrollo genuino.',
    date: 'Hace 2 horas',
  },
  {
    id: 2,
    user: 'Sakura',
    manga: 'Chainsaw Man',
    rating: 4,
    comment: 'Historia única y personajes memorables. Fujimoto no tiene miedo de romper las reglas del shonen tradicional.',
    date: 'Hace 5 horas',
  },
  {
    id: 3,
    user: 'Yuki',
    manga: 'Berserk',
    rating: 5,
    comment: 'Simplemente legendario. Una experiencia que todo amante del manga debe vivir.',
    date: 'Hace 1 día',
  },
  {
    id: 4,
    user: 'Hiro',
    manga: 'Vagabond',
    rating: 5,
    comment: 'Una meditación visual sobre el bushido y el crecimiento personal.',
    date: 'Hace 2 días',
  },
]

function ReviewsPage() {
  return (
    <div className="figma-page">
      <section className="list-header">
        <div>
          <h1>Reseñas</h1>
          <p>Opiniones breves de lectores para descubrir qué vale la pena seguir.</p>
        </div>
        <button type="button" className="primary-action">＋ Nueva reseña</button>
      </section>

      <div className="figma-content">
        <div className="review-list review-list-wide">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReviewsPage
