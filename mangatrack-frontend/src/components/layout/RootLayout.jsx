import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { useState } from 'react'

import ToastViewport from '../common/ToastViewport.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import useAuth from '../../hooks/useAuth.js'

function RootLayout() {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()
  const isAdminView = location.pathname.startsWith('/admin')

  return (
    <div className={`app-shell ${isCollapsed ? 'app-shell-collapsed' : ''} ${isAdminView ? 'app-shell-admin' : ''}`}>
      <Sidebar
        hideSidebar={isAdminView}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((current) => !current)}
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
      />

      <main className="page-container">
        <Outlet />
      </main>

      <ToastViewport />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout
