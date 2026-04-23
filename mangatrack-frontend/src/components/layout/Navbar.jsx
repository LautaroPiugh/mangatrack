import { Link, NavLink, useNavigate } from 'react-router-dom'

import useFeedback from '../../hooks/useFeedback.js'
import useAuth from '../../hooks/useAuth.js'

const getNavLinkClassName = ({ isActive }) => (
  `nav-link ${isActive ? 'nav-link-active' : ''}`
)

function Navbar() {
  const navigate = useNavigate()
  const { notify } = useFeedback()
  const { isAuthenticated, logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    notify({
      variant: 'info',
      title: 'Sesion cerrada',
      message: 'La sesion fue cerrada correctamente.',
    })
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="brand-block">
        <Link to="/" className="brand-mark">
          MT
        </Link>

        <div>
          <Link to="/" className="brand-title">
            MangaTrack
          </Link>
          <p className="brand-copy">Catalogo, seguimiento de lectura y resenas en un solo lugar.</p>
        </div>
      </div>

      <nav className="nav-cluster">
        <NavLink to="/mangas" className={getNavLinkClassName}>
          Mangas
        </NavLink>
        <NavLink to="/reviews" className={getNavLinkClassName}>
          Reviews
        </NavLink>

        {isAuthenticated ? (
          <>
            <NavLink to="/mangas/new" className={getNavLinkClassName}>
              Nuevo manga
            </NavLink>
            <NavLink to="/reviews/new" className={getNavLinkClassName}>
              Nueva review
            </NavLink>
            <NavLink to="/my-reviews" className={getNavLinkClassName}>
              Mis reviews
            </NavLink>

            <div className="session-block">
              <span className="session-user">{user?.name}</span>
              <button type="button" className="button button-ghost" onClick={handleLogout}>
                Cerrar sesion
              </button>
            </div>
          </>
        ) : (
          <div className="nav-actions">
            <Link to="/login" className="button button-ghost">
              Ingresar
            </Link>
            <Link to="/register" className="button button-primary">
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
