import { Link } from 'react-router-dom'

import { getInitials } from '../../utils/formatters.js'

function MangaCard({ manga }) {
  const shortDescription = manga.description.length > 160
    ? `${manga.description.slice(0, 157)}...`
    : manga.description

  return (
    <article className="card manga-card">
      <Link to={`/mangas/${manga._id}`} className="cover-shell">
        {manga.coverImage ? (
          <img src={manga.coverImage} alt={`Portada de ${manga.title}`} className="cover-image" />
        ) : (
          <div className="cover-fallback">
            <span>{getInitials(manga.title)}</span>
          </div>
        )}
      </Link>

      <div className="card-content">
        <div className="card-copy">
          <span className="card-kicker">{manga.genre}</span>
          <h3>{manga.title}</h3>
          <p className="card-meta">por {manga.author}</p>
          <p>{shortDescription}</p>
        </div>

        <div className="card-actions">
          <Link to={`/mangas/${manga._id}`} className="button button-secondary">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  )
}

export default MangaCard
