import { useEffect, useRef, useState } from 'react'

const getDisplayName = (user) => (
  user?.name
  || user?.username
  || user?.email
  || 'Mi cuenta'
)

const getInitial = (user) => (
  getDisplayName(user).trim().slice(0, 1).toUpperCase() || 'M'
)

function Header({ user, isAuthenticated = false, searchQuery, onSearchChange, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const displayName = isAuthenticated ? getDisplayName(user) : 'Mi cuenta'
  const email = user?.email

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

  const handleSearch = (event) => {
    event.preventDefault()
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
    onLogout?.()
  }

  return (
    <header className="topbar">
      <form className="global-search" onSubmit={handleSearch}>
        <span className="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder="Buscar mangas..."
          aria-label="Buscar mangas"
        />
      </form>

      <div className="topbar-actions">
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
              {email ? <small>{email}</small> : null}
            </span>
            <span className="avatar avatar-button">{isAuthenticated ? getInitial(user) : 'M'}</span>
          </button>

          {isMenuOpen ? (
            <div className="user-dropdown" role="menu">
              <button type="button" role="menuitem">Mi perfil</button>
              <button type="button" role="menuitem">Mis favoritos</button>
              <button type="button" role="menuitem">Pendientes</button>
              <span className="user-dropdown-divider" />
              <button type="button" role="menuitem" className="user-dropdown-danger" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
