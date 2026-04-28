import { useCallback, useEffect, useMemo, useState } from 'react'

import authService from '../services/authService.js'
import {
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredSession,
} from '../services/api.js'
import AuthContext from './auth-context.js'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    authService.logout()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const nextUser = await authService.getMe()
    setUser(nextUser)
    setStoredSession({ token: getStoredToken(), user: nextUser })
    return nextUser
  }, [])

  const isAuthFailure = useCallback((error) => (
    error?.status === 401 || error?.status === 403
  ), [])

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getStoredToken()

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        setToken(storedToken)
        await refreshUser()
      } catch (error) {
        if (isAuthFailure(error)) {
          logout()
        }
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [isAuthFailure, logout, refreshUser])

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials)

    setToken(response.token)
    setUser(response.user)

    return response
  }, [])

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload)

    if (response.token) {
      setToken(response.token)
      setUser(response.user)
    } else {
      clearStoredSession()
      setToken(null)
      setUser(null)
    }

    return response
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    getMe: refreshUser,
  }), [isLoading, login, logout, refreshUser, register, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
