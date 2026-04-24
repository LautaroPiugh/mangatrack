import { request, unwrapData } from './api.js'

export const userLibraryService = {
  async getFavorites() {
    return unwrapData(await request('/users/me/favorites'))
  },
  async addFavorite(mangaId) {
    return unwrapData(await request(`/users/me/favorites/${mangaId}`, {
      method: 'POST',
    }))
  },
  async removeFavorite(mangaId) {
    return unwrapData(await request(`/users/me/favorites/${mangaId}`, {
      method: 'DELETE',
    }))
  },
  async getWatchlist() {
    return unwrapData(await request('/users/me/watchlist'))
  },
  async addToWatchlist(mangaId) {
    return unwrapData(await request(`/users/me/watchlist/${mangaId}`, {
      method: 'POST',
    }))
  },
  async removeFromWatchlist(mangaId) {
    return unwrapData(await request(`/users/me/watchlist/${mangaId}`, {
      method: 'DELETE',
    }))
  },
}

export default userLibraryService
