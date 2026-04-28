import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import useI18n from '../../hooks/useI18n.js'
import searchService from '../../services/searchService.js'
import ImageWithFallback from '../common/ImageWithFallback.jsx'
import UserAvatar from '../user/UserAvatar.jsx'

function SearchBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const containerRef = useRef(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], mangas: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const trimmedQuery = query.trim()
  const hasResults = results.users.length > 0 || results.mangas.length > 0
  const shouldShowDropdown = isOpen && trimmedQuery.length >= 2

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setResults({ users: [], mangas: [] })
      setIsLoading(false)
      return undefined
    }

    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true)

      try {
        const nextResults = await searchService.search(trimmedQuery)

        if (!cancelled) {
          setResults(nextResults)
        }
      } catch {
        if (!cancelled) {
          setResults({ users: [], mangas: [] })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [trimmedQuery])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!trimmedQuery) {
      return
    }

    navigate({
      pathname: '/mangas',
      search: `?q=${encodeURIComponent(trimmedQuery)}`,
    })
  }

  return (
    <div className="global-search-shell" ref={containerRef}>
      <form className="global-search" onSubmit={handleSubmit}>
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={t('header.searchPlaceholder')}
          aria-label={t('header.searchLabel')}
        />
      </form>

      {shouldShowDropdown ? (
        <div className="global-search-dropdown">
          {isLoading ? (
            <div className="global-search-state">{t('header.searchLoading')}</div>
          ) : null}

          {!isLoading && !hasResults ? (
            <div className="global-search-state">{t('header.searchNoResults')}</div>
          ) : null}

          {!isLoading && results.users.length ? (
            <section className="global-search-section">
              <div className="global-search-heading">{t('header.searchUsers')}</div>
              <div className="global-search-list">
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    to={`/users/${user.username}`}
                    className="global-search-item"
                  >
                    <span className="global-search-avatar">
                      <UserAvatar user={user} size={32} />
                    </span>
                    <span className="global-search-copy">
                      <strong>@{user.username}</strong>
                      <small>{t('header.searchUserLabel')}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {!isLoading && results.mangas.length ? (
            <section className="global-search-section">
              <div className="global-search-heading">{t('header.searchMangas')}</div>
              <div className="global-search-list">
                {results.mangas.map((manga) => (
                  <Link
                    key={manga.id}
                    to={`/mangas/${manga.slug}`}
                    className="global-search-item"
                  >
                    <ImageWithFallback
                      src={manga.cover || manga.coverUrl}
                      alt={manga.title}
                      className="global-search-cover"
                      fallbackClassName="global-search-cover"
                    />
                    <span className="global-search-copy">
                      <strong>{manga.title}</strong>
                      <small>{t('header.searchMangaLabel')}</small>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default SearchBar
