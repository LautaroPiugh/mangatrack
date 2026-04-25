import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useState } from 'react'

import ToastViewport from '../common/ToastViewport.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import useAuth from '../../hooks/useAuth.js'

function RootLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isAuthenticated, logout, user } = useAuth()

  return (
    <div className={`app-shell ${isCollapsed ? 'app-shell-collapsed' : ''}`}>
      <Sidebar
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
