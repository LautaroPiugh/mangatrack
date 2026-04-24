import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useState } from 'react'

import ToastViewport from '../common/ToastViewport.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'
import useAuth from '../../hooks/useAuth.js'

function RootLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="page-container">
        <Outlet context={{ searchQuery, setSearchQuery }} />
      </main>

      <ToastViewport />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout
