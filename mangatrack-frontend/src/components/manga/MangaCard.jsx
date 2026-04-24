import ImageWithFallback from '../common/ImageWithFallback.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useUserLibrary from '../../hooks/useUserLibrary.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const getMangaId = (manga) => manga?._id || manga?.id || null

function MangaCard({ manga }) {
  const navigate = useNavigate()
  const { notify } = useFeedback()
  const {
    isFavorite,
    isInWatchlist,
    addFavorite,
    removeFavorite,
    addToWatchlist,
    removeFromWatchlist,
    isLoading: isLibraryLoading,
  } = useUserLibrary()
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false)
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false)

  const mangaId = getMangaId(manga)
  const rating = manga.rating ?? manga.averageRating ?? manga.reviewSummary?.averageRating ?? 0
  const votes = manga.votes ?? manga.ratingsCount ?? manga.reviewSummary?.totalReviews ?? 0
  const cover = manga.cover || manga.coverUrl || manga.coverImage
  const metaCopy = votes
    ? `${Number(votes).toLocaleString('es-AR')} valoraciones`
    : manga.author || manga.artist || manga.genres?.[0] || manga.genre || 'Manga'
  const detailSlug = manga.slug || mangaId
  const favoriteActive = mangaId ? isFavorite(mangaId) : false
  const watchlistActive = mangaId ? isInWatchlist(mangaId) : false

  const openDetail = () => {
    if (!detailSlug) {
      return
    }

    navigate(`/mangas/${detailSlug}`)
  }

  const handleFavorite = async (event) => {
    event.stopPropagation()

    if (!mangaId || isFavoriteLoading || isLibraryLoading) {
      return
    }

    setIsFavoriteLoading(true)

    try {
      if (favoriteActive) {
        await removeFavorite(mangaId)
      } else {
        await addFavorite(mangaId)
      }
    } catch (error) {
      notify({
        variant: 'error',
        title: 'No se pudo actualizar favoritos',
        message: error.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsFavoriteLoading(false)
    }
  }

  const handleWatchlist = async (event) => {
    event.stopPropagation()

    if (!mangaId || isWatchlistLoading || isLibraryLoading) {
      return
    }

    setIsWatchlistLoading(true)

    try {
      if (watchlistActive) {
        await removeFromWatchlist(mangaId)
      } else {
        await addToWatchlist(mangaId)
      }
    } catch (error) {
      notify({
        variant: 'error',
        title: 'No se pudo actualizar pendientes',
        message: error.message || 'Intentá nuevamente.',
      })
    } finally {
      setIsWatchlistLoading(false)
    }
  }

  return (
    <article
      className="figma-manga-card figma-manga-card-clickable"
      role="link"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDetail()
        }
      }}
    >
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
              className={favoriteActive ? 'figma-action figma-action-active' : 'figma-action'}
              onClick={handleFavorite}
              aria-label={favoriteActive ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              aria-pressed={favoriteActive}
              disabled={isFavoriteLoading || isLibraryLoading}
            >
              {isFavoriteLoading ? '…' : '♥'}
            </button>
            <button
              type="button"
              className={watchlistActive ? 'figma-action figma-action-pending' : 'figma-action'}
              onClick={handleWatchlist}
              aria-label={watchlistActive ? 'Quitar de pendientes' : 'Agregar a pendientes'}
              aria-pressed={watchlistActive}
              disabled={isWatchlistLoading || isLibraryLoading}
            >
              {isWatchlistLoading ? '…' : '＋'}
            </button>
          </div>

          <div className="figma-card-flags" aria-live="polite">
            {favoriteActive ? <span className="figma-card-flag">Favorito</span> : null}
            {watchlistActive ? <span className="figma-card-flag figma-card-flag-pending">Pendiente</span> : null}
          </div>
        </div>
      </div>

      <div className="figma-card-copy">
        <h3>{manga.title}</h3>
        <p>{metaCopy}</p>
      </div>
    </article>
  )
}

export default MangaCard
