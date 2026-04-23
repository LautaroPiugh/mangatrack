import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'mangatrack_token'
export const USER_STORAGE_KEY = 'mangatrack_user'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getResponseData = (response) => response.data

export const getApiErrorMessage = (error, fallbackMessage = 'Ocurrio un error inesperado.') => (
  error.response?.data?.message
  || error.message
  || fallbackMessage
)

export default apiClient
