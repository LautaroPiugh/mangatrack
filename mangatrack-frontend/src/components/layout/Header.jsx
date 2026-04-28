import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import ConfirmDialog from '../common/ConfirmDialog.jsx'
import UserAvatar from '../user/UserAvatar.jsx'
import SearchBar from './SearchBar.jsx'
import useFeedback from '../../hooks/useFeedback.js'
import useI18n from '../../hooks/useI18n.js'

const getDisplayName = (user, fallbackLabel) => (
  user?.displayName
  || user?.username
  || user?.name
  || user?.email
  || fallbackLabel
)

const getMenuItems = (user, t) => {
  if (!user) {
    return [
      { label: t('nav.login'), path: '/login' },
      { label: t('nav.register'), path: '/register' },
    ]
  }

  const items = [
    { label: t('nav.myProfile'), path: '/profile' },
    ...(user?.username ? [{ label: t('nav.publicProfile'), path: `/users/${user.username}` }] : []),
    { label: t('nav.library'), path: '/library' },
    { label: t('nav.myLists'), path: '/lists' },
    { label: t('nav.settings'), path: '/settings/profile' },
    { label: t('nav.favorites'), path: '/library?tab=favorites' },
    { label: t('nav.watchlist'), path: '/library?tab=watchlist' },
  ]

  if (user?.role === 'admin') {
    items.unshift({ label: t('nav.adminPanel'), path: '/admin' })
  }

  return items
}

function UserMenu({ user, isAuthenticated = false, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useFeedback()
  const { t } = useI18n()
  const fallbackLabel = t('nav.myAccount')
  const displayName = isAuthenticated ? getDisplayName(user, fallbackLabel) : fallbackLabel
  const secondaryLine = user?.email || user?.name

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

  const handleNavigate = (path) => {
    setIsMenuOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setIsMenuOpen(false)
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
    if (location.pathname !== '/login') {
      navigate('/login')
    }
  }

  return (
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
          {secondaryLine ? <small>{secondaryLine}</small> : null}
        </span>
        <span className="avatar avatar-button">
          {isAuthenticated
            ? <UserAvatar user={user} size={32} />
            : 'M'}
        </span>
      </button>

      {isMenuOpen ? (
        <div className="user-dropdown" role="menu">
          {getMenuItems(user, t).map((item) => (
            <button
              key={item.path}
              type="button"
              role="menuitem"
              onClick={() => handleNavigate(item.path)}
            >
              {item.label}
            </button>
          ))}
          {isAuthenticated ? (
            <>
              <div className="user-dropdown-divider" />
              <button type="button" role="menuitem" className="user-dropdown-danger" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

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
    </div>
  )
}

function Header({ user, isAuthenticated = false, onLogout }) {
  const location = useLocation()

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-search-slot">
          <SearchBar />
        </div>

        <div className="topbar-actions">
          <UserMenu
            key={`${location.pathname}${location.search}`}
            isAuthenticated={isAuthenticated}
            user={user}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
