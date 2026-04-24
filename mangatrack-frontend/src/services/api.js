export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const TOKEN_STORAGE_KEY = 'mangatrack_token'
export const USER_STORAGE_KEY = 'mangatrack_user'

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type')

  if (!contentType?.includes('application/json')) {
    return null
  }

  return response.json()
}

export const getStoredToken = () => localStorage.getItem(TOKEN_STORAGE_KEY)

export const setStoredSession = ({ token, user }) => {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  }

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
}

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export const getStoredUser = () => {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY)

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

export const request = async (path, options = {}) => {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  })

  const payload = await parseResponse(response)

  if (!response.ok) {
    const message = payload?.message
      || payload?.errors?.[0]?.msg
      || 'No se pudo completar la operación.'

    const error = new Error(message)
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

export const unwrapData = (payload) => payload?.data ?? payload
