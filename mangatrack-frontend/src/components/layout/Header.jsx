import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const getDisplayName = (user) => (
  user?.username
  || user?.name
  || user?.email
  || 'Mi cuenta'
)

const getInitial = (user) => (
  getDisplayName(user).trim().slice(0, 1).toUpperCase() || 'M'
)

const getMenuItems = (user) => {
  const items = [
    { label: 'Mi perfil', path: '/profile' },
    { label: 'Mi biblioteca', path: '/library' },
    { label: 'Favoritos', path: '/library?tab=favorites' },
    { label: 'Pendientes', path: '/library?tab=watchlist' },
  ]

  if (user?.role === 'admin') {
    items.unshift({ label: 'Panel admin', path: '/admin' })
  }

  return items
}

function UserMenu({ user, isAuthenticated = false, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const displayName = isAuthenticated ? getDisplayName(user) : 'Mi cuenta'
  const secondaryLine = user?.email || user?.name

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMenuOpen])

  const handleNavigate = (path) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
    onLogout?.()
    if (location.pathname !== '/login') {
      navigate('/login')
    }
  }

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span className="header-user-copy">
          <strong>{displayName}</strong>
          {secondaryLine ? <small>{secondaryLine}</small> : null}
        </span>
        <span className="avatar avatar-button">{isAuthenticated ? getInitial(user) : 'M'}</span>
      </button>

      {isMenuOpen ? (
        <div className="user-dropdown" role="menu">
          {getMenuItems(user).map((item) => (
            <button
              key={item.path}
              type="button"
              role="menuitem"
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          <div className="user-dropdown-divider" />
          <button type="button" role="menuitem" className="user-dropdown-danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      ) : null}
    </div>
  )
}

function Header({ user, isAuthenticated = false, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (event) => {
    event.preventDefault()
    const normalizedQuery = searchQuery.trim()
    const searchParams = new URLSearchParams()

    if (normalizedQuery) {
      searchParams.set('q', normalizedQuery)
    }

    navigate({
      pathname: '/mangas',
      search: searchParams.toString() ? `?${searchParams.toString()}` : '',
    })
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-search-slot">
          <form className="global-search" onSubmit={handleSearch}>
            <span className="search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar mangas..."
              aria-label="Buscar mangas"
            />
          </form>
        </div>

        <div className="topbar-actions">
          <UserMenu
            key={`${location.pathname}${location.search}`}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
