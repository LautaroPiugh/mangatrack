import { useCallback, useEffect, useMemo, useState } from 'react'

import useAuth from '../hooks/useAuth.js'
import userService from '../services/userService.js'
import ThemeContext from './theme-context.js'

const THEME_KEY = 'mangatrack-theme'

const getStoredTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) || 'dark'
  } catch {
    return 'dark'
  }
}

const setStoredTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
}

export function ThemeProvider({ children }) {
  const { user, isAuthenticated, refreshUser } = useAuth()
  const userKey = user?.id || user?._id || 'guest'
  const [pendingTheme, setPendingTheme] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const storedTheme = getStoredTheme()
  const userTheme = user?.preferences?.theme || null
  const optimisticTheme = pendingTheme?.userKey === userKey && pendingTheme.value !== userTheme
    ? pendingTheme.value
    : null
  const theme = optimisticTheme || userTheme || storedTheme

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback(async (nextTheme, options = {}) => {
    if (!['dark', 'light'].includes(nextTheme)) {
      return
    }

    const previousTheme = theme
    const shouldPersist = options.persist !== false

    setPendingTheme({
      userKey,
      value: nextTheme,
    })
    setStoredTheme(nextTheme)

    if (isAuthenticated && shouldPersist) {
      setIsLoading(true)
      try {
        await userService.updatePreferences({ theme: nextTheme })
        await refreshUser()
      } catch {
        setStoredTheme(previousTheme)
      } finally {
        setPendingTheme(null)
        setIsLoading(false)
      }
      return
    }

    if (isAuthenticated && !shouldPersist) {
      return
    }
  }, [isAuthenticated, refreshUser, theme, userKey])

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    await setTheme(newTheme)
  }, [setTheme, theme])

  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme,
    isLoading,
  }), [isLoading, setTheme, theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}
