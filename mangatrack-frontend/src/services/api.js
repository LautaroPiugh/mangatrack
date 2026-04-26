export const TOKEN_STORAGE_KEY = 'mangatrack_token'
export const USER_STORAGE_KEY = 'mangatrack_user'

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const setStoredSession = ({ token, user }) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    }

    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    }
  } catch {
    // ignore storage errors
  }
}

export const clearStoredSession = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  } catch {
    // ignore storage errors
  }
}

export const getStoredUser = () => {
  let storedUser = null

  try {
    storedUser = localStorage.getItem(USER_STORAGE_KEY)
  } catch {
    return null
  }

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    clearStoredSession()
    return null
  }
}
