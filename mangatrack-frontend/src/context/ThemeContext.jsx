import { createContext, useContext, useEffect, useState } from 'react'

import useAuth from '../hooks/useAuth.js'
import userService from '../services/userService.js'

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  isLoading: false,
})

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
  const { user, isAuthenticated } = useAuth()
  const [theme, setTheme] = useState(getStoredTheme)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user?.preferences?.theme) {
      setTheme(user.preferences.theme)
    } else {
      setTheme(getStoredTheme())
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    document.documentElement.className = theme
  }, [theme])

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    setStoredTheme(newTheme)

    if (isAuthenticated) {
      setIsLoading(true)
      try {
        await userService.updatePreferences({ theme: newTheme })
      } catch (error) {
        // Revert on error
        setTheme(theme)
        setStoredTheme(theme)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const value = {
    theme,
    toggleTheme,
    isLoading,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext