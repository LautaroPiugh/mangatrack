import { useEffect, useState } from 'react'

import authApi from '../api/authApi.js'
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  getApiErrorMessage,
} from '../api/axiosClient.js'
import AuthContext from './auth-context.js'

const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

const persistSession = (token, user) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const bootstrapSession = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)

      if (storedToken) {
        setToken(storedToken)
      }

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch {
          clearStoredSession()
        }
      }

      if (!storedToken) {
        setIsBootstrapping(false)
        return
      }

      try {
        const response = await authApi.getCurrentUser()
        setUser(response.data.user)
        persistSession(storedToken, response.data.user)
      } catch {
        setUser(null)
        setToken(null)
        clearStoredSession()
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrapSession()
  }, [])

  const login = async (credentials) => {
    const response = await authApi.login(credentials)
    const nextToken = response.data.token
    const nextUser = response.data.user

    setToken(nextToken)
    setUser(nextUser)
    persistSession(nextToken, nextUser)

    return response
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    clearStoredSession()
  }

  const value = {
    user,
    token,
    isBootstrapping,
    isAuthenticated: Boolean(token && user),
    login,
    logout,
    register: authApi.register,
    refreshCurrentUser: async () => {
      try {
        const response = await authApi.getCurrentUser()
        setUser(response.data.user)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user))
        return response.data.user
      } catch (error) {
        logout()
        throw new Error(getApiErrorMessage(error))
      }
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
