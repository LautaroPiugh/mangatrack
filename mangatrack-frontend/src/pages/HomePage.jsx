import MangaCard from '../components/manga/MangaCard.jsx'
import ReviewCard from '../components/review/ReviewCard.jsx'

const trendingMangas = [
  { id: 1, title: 'One Piece', cover: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500', rating: 4.8, votes: 15234 },
  { id: 2, title: 'Attack on Titan', cover: 'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500', rating: 4.9, votes: 18492 },
  { id: 3, title: 'Death Note', cover: 'https://images.unsplash.com/photo-1760113671986-63ccb46ae202?w=500', rating: 4.7, votes: 12847 },
  { id: 4, title: 'Naruto Shippuden', cover: 'https://images.unsplash.com/photo-1673047233297-41890c998920?w=500', rating: 4.6, votes: 14523 },
  { id: 5, title: 'My Hero Academia', cover: 'https://images.unsplash.com/photo-1569701813229-33284b643e3c?w=500', rating: 4.5, votes: 11234 },
  { id: 6, title: 'Demon Slayer', cover: 'https://images.unsplash.com/photo-1666153184621-bc6445e3568d?w=500', rating: 4.8, votes: 16789 },
]

const recentReviews = [
  {
    id: 1,
    user: 'Kenji',
    manga: 'Jujutsu Kaisen',
    rating: 5,
    comment: 'Una obra maestra del shonen moderno. Los combates están increíblemente coreografiados.',
    date: 'Hace 2 horas',
  },
  {
    id: 2,
    user: 'Sakura',
    manga: 'Chainsaw Man',
    rating: 4,
    comment: 'Historia única y personajes memorables. El arte es brutal en el mejor sentido.',
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
]

const stats = [
  { label: 'Mangas leídos', value: '47', icon: '本', color: 'green' },
  { label: 'Reseñas escritas', value: '23', icon: '★', color: 'orange' },
  { label: 'Pendientes', value: '12', icon: '◷', color: 'blue' },
  { label: 'Horas de lectura', value: '156', icon: '↗', color: 'purple' },
]

function HomePage() {
  return (
    <div className="figma-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-inner">
          <h1>Descubrí, valorá y organizá tus mangas favoritos.</h1>
          <p>Seguí tus lecturas, guardá pendientes y compartí reseñas breves.</p>
        </div>
      </section>

      <div className="figma-content">
        <section className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card stat-card-${stat.color}`}>
              <span className="stat-icon">{stat.icon}</span>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>↗</span>
            <h2>Tendencias</h2>
          </div>
          <div className="manga-grid">
            {trendingMangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        </section>

        <section className="figma-section">
          <div className="section-title">
            <span>★</span>
            <h2>Reseñas recientes</h2>
          </div>
          <div className="review-list">
            {recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
