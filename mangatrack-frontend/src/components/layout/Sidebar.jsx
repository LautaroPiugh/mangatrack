import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import ConfirmDialog from '../common/ConfirmDialog.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'

function Sidebar({ hideSidebar = false, isCollapsed, onToggle, isAuthenticated, onLogout }) {
  const navigate = useNavigate()
  const { notify } = useFeedback()
  const { t } = useI18n()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  if (hideSidebar) {
    return null
  }
  const navItems = [
    { icon: '↻', label: t('nav.feed'), path: '/' },
    ...(isAuthenticated ? [{ icon: '⌂', label: t('nav.dashboard'), path: '/home' }] : []),
    { icon: '本', label: t('nav.mangas'), path: '/mangas' },
    { icon: '★', label: t('nav.reviews'), path: '/reviews' },
    ...(isAuthenticated ? [{ icon: '☰', label: t('nav.library'), path: '/library' }] : []),
    ...(isAuthenticated ? [{ icon: '▤', label: t('nav.lists'), path: '/lists' }] : []),
  ]

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false)
    onLogout?.()
    notify({
      variant: 'info',
      title: t('notifications.logoutTitle'),
      message: t('notifications.logoutMessage'),
    })
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

      <nav className="sidebar-nav" aria-label={t('nav.mainNavigation')}>
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
            title={isCollapsed ? t('nav.logout') : undefined}
            onClick={handleLogout}
          >
            <span className="sidebar-link-icon">↪</span>
            {!isCollapsed ? <span>{t('nav.logout')}</span> : null}
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className={`sidebar-link ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
              title={isCollapsed ? t('nav.login') : undefined}
            >
              <span className="sidebar-link-icon">→</span>
              {!isCollapsed ? <span>{t('nav.login')}</span> : null}
            </Link>
            <Link
              to="/register"
              className={`sidebar-link sidebar-link-accent ${isCollapsed ? 'sidebar-link-collapsed' : ''}`}
              title={isCollapsed ? t('nav.register') : undefined}
            >
              <span className="sidebar-link-icon">＋</span>
              {!isCollapsed ? <span>{t('nav.register')}</span> : null}
            </Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label={isCollapsed ? t('nav.openMenu') : t('nav.closeMenu')}
      >
        {isCollapsed ? '›' : '‹'}
      </button>

      <ConfirmDialog
        open={showLogoutConfirm}
        title={t('confirmDialog.logoutTitle')}
        description={t('confirmDialog.logoutDescription')}
        confirmLabel={t('confirmDialog.logoutConfirm')}
        cancelLabel={t('common.cancel')}
        variant="default"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  )
}

export default Sidebar
