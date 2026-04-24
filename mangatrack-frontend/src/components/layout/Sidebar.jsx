import { Link, NavLink, useNavigate } from 'react-router-dom'

function Sidebar({ isCollapsed, onToggle, isAuthenticated, onLogout }) {
  const navigate = useNavigate()
  const navItems = [
    { icon: '⌂', label: 'Inicio', path: '/' },
    { icon: '本', label: 'Mangas', path: '/mangas' },
    { icon: '★', label: 'Reseñas', path: '/reviews' },
    ...(isAuthenticated ? [{ icon: '☰', label: 'Biblioteca', path: '/library' }] : []),
  ]

  const handleLogout = () => {
    onLogout?.()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-brand">
        <Link to="/" className="sidebar-logo" title={isCollapsed ? 'MangaTrack' : undefined}>
          <span className="sidebar-logo-mark">本</span>
          {!isCollapsed ? <span className="sidebar-logo-text">MangaTrack</span> : null}
        </Link>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => (
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${isCollapsed ? 'sidebar-link-collapsed' : ''}`
            )}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!isCollapsed ? <span>{item.label}</span> : null}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {isAuthenticated ? (
          <button
            type="button"
            className={`sidebar-link sidebar-logout ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
            title={isCollapsed ? 'Salir' : undefined}
            onClick={handleLogout}
          >
            <span className="sidebar-link-icon">↪</span>
            {!isCollapsed ? <span>Salir</span> : null}
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className={`sidebar-link ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
              title={isCollapsed ? 'Iniciar sesión' : undefined}
            >
              <span className="sidebar-link-icon">→</span>
              {!isCollapsed ? <span>Ingresar</span> : null}
            </Link>
            <Link
              to="/register"
              className={`sidebar-link sidebar-link-accent ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
              title={isCollapsed ? 'Crear cuenta' : undefined}
            >
              <span className="sidebar-link-icon">＋</span>
              {!isCollapsed ? <span>Crear cuenta</span> : null}
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {isCollapsed ? '›' : '‹'}
      </button>
    </aside>
  )
}

export default Sidebar
