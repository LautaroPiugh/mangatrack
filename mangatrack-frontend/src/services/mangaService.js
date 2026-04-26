import axiosClient from '../api/axiosClient.js'
import { buildParams, getCollectionPayload, getPayloadData, runRequest } from './http.js'

export const mangaService = {
  async getMangas(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/mangas', {
        params: buildParams(params),
      })
      return getCollectionPayload(response)
    }, 'No se pudieron cargar los mangas.')
  },
  async getManga(idOrSlug) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/mangas/${idOrSlug}`)
      return getPayloadData(response)
    }, 'No se pudo cargar el manga.')
  },
  async getMangaReviews(id, params) {
    return runRequest(async () => {
      const response = await axiosClient.get(`/mangas/${id}/reviews`, {
        params: buildParams(params),
      })

      return {
        manga: response.data?.data?.manga || null,
        reviewSummary: response.data?.data?.reviewSummary || null,
        items: response.data?.data?.reviews || [],
        meta: response.data?.meta || null,
      }
    }, 'No se pudieron cargar las reseñas del manga.')
  },
  async createManga(payload) {
    return runRequest(async () => {
      const response = await axiosClient.post('/mangas', payload)
      return getPayloadData(response)
    }, 'No se pudo crear el manga.')
  },
  async updateManga(id, payload) {
    return runRequest(async () => {
      const response = await axiosClient.put(`/mangas/${id}`, payload)
      return getPayloadData(response)
    }, 'No se pudo actualizar el manga.')
  },
  async deleteManga(id) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/mangas/${id}`)
      return getPayloadData(response)
    }, 'No se pudo eliminar el manga.')
  },
}

export default mangaService
