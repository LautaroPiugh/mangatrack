import { getInitials } from '../../utils/formatters.js'

const posterThemes = ['crimson', 'violet', 'sakura', 'night', 'jade', 'sunset']

const hashString = (value = '') => (
  value
    .split('')
    .reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0)
)

const getPosterTheme = (seed = '') => (
  posterThemes[hashString(seed) % posterThemes.length]
)

function MangaPoster({ manga, size = 'card', className = '' }) {
  const theme = getPosterTheme(`${manga.title || ''}${manga.genre || ''}`)
  const posterClassName = [
    'manga-poster',
    `manga-poster-${size}`,
    `manga-poster-${theme}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (manga.coverImage) {
    return (
      <div className={posterClassName}>
        <img
          src={manga.coverImage}
          alt={`Portada de ${manga.title}`}
          className="manga-poster-image"
        />
      </div>
    )
  }

  return (
    <div className={posterClassName} aria-hidden="true">
      <div className="manga-poster-art">
        <span className="manga-poster-sun" />
        <span className="manga-poster-ink" />
        <span className="manga-poster-grid" />

        <div className="manga-poster-copy">
          <span className="manga-poster-label">{manga.genre || 'Manga'}</span>
          <strong className="manga-poster-initials">{getInitials(manga.title)}</strong>
          <span className="manga-poster-title">{manga.title}</span>
        </div>
      </div>
    </div>
  )
}

export default MangaPoster
