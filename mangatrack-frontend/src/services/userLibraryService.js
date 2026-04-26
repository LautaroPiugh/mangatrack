import axiosClient from '../api/axiosClient.js'
import { getPayloadData, runRequest } from './http.js'

export const userLibraryService = {
  async getFavorites() {
    return runRequest(async () => {
      const response = await axiosClient.get('/users/me/favorites')
      return getPayloadData(response) || []
    }, 'No se pudieron cargar tus favoritos.')
  },
  async addFavorite(mangaId) {
    return runRequest(async () => {
      const response = await axiosClient.post(`/users/me/favorites/${mangaId}`)
      return getPayloadData(response) || []
    }, 'No se pudo agregar el manga a favoritos.')
  },
  async removeFavorite(mangaId) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/users/me/favorites/${mangaId}`)
      return getPayloadData(response) || []
    }, 'No se pudo quitar el manga de favoritos.')
  },
  async getWatchlist() {
    return runRequest(async () => {
      const response = await axiosClient.get('/users/me/watchlist')
      return getPayloadData(response) || []
    }, 'No se pudieron cargar tus pendientes.')
  },
  async addToWatchlist(mangaId) {
    return runRequest(async () => {
      const response = await axiosClient.post(`/users/me/watchlist/${mangaId}`)
      return getPayloadData(response) || []
    }, 'No se pudo agregar el manga a pendientes.')
  },
  async removeFromWatchlist(mangaId) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/users/me/watchlist/${mangaId}`)
      return getPayloadData(response) || []
    }, 'No se pudo quitar el manga de pendientes.')
  },
}

export default userLibraryService
