import axios from 'axios'

import { TOKEN_STORAGE_KEY } from '../services/api.js'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers ||= {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {}
    const method = (config.method || 'get').toLowerCase()
    const shouldRetry = (
      error.code === 'ECONNABORTED'
      && method === 'get'
      && !config.__retriedAfterTimeout
    )

    if (!shouldRetry) {
      return Promise.reject(error)
    }

    config.__retriedAfterTimeout = true
    config.timeout = Math.max(config.timeout || 0, 30000)

    return apiClient(config)
  },
)

export const getResponseData = (response) => response.data

export const getApiErrorMessage = (error, fallbackMessage = 'Ocurrio un error inesperado.') => {
  if (error.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder. Intentá nuevamente en unos segundos.'
  }

  return (
    error.response?.data?.message
    || error.message
    || fallbackMessage
  )
}

export default apiClient
