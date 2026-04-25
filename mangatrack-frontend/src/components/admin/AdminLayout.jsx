import { Link, Outlet, useLocation } from 'react-router-dom'

function AdminLayout() {
  const location = useLocation()

  const navItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/mangas', label: 'Mangas' },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Panel Admin</h2>
          <Link to="/" className="admin-sidebar-back">
            ← Volver a la app
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar-link ${
                item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path)
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout