import { Link, Outlet, useLocation } from 'react-router-dom'

function AdminLayout() {
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/mangas', label: 'Mangas' },
  ]

  return (
    <div className="admin-layout">
      <header className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Panel Admin</h2>
          <Link to="/" className="admin-sidebar-back">
            ← Volver a la app
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            (() => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`admin-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })()
          ))}
        </nav>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
