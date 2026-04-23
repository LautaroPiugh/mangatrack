import { Outlet, ScrollRestoration } from 'react-router-dom'

import ToastViewport from '../common/ToastViewport.jsx'
import Navbar from './Navbar.jsx'

function RootLayout() {
  return (
    <div className="app-shell">
      <div className="background-orb background-orb-a" />
      <div className="background-orb background-orb-b" />

      <Navbar />

      <main className="page-container">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>MangaTrack</span>
        <span>Proyecto final full-stack con React, Express y MongoDB.</span>
      </footer>

      <ToastViewport />
      <ScrollRestoration />
    </div>
  )
}

export default RootLayout
