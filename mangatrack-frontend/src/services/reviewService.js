import axiosClient from '../api/axiosClient.js'
import { buildParams, getCollectionPayload, getPayloadData, runRequest } from './http.js'

export const reviewService = {
  async getReviews(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/reviews', {
        params: buildParams(params),
      })
      return getCollectionPayload(response)
    }, 'No se pudieron cargar las reseñas.')
  },
  async getRecentReviews(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/reviews/recent', {
        params: buildParams(params),
      })
      return getPayloadData(response) || []
    }, 'No se pudieron cargar las reseñas recientes.')
  },
  async getMyReviews(params) {
    return runRequest(async () => {
      const response = await axiosClient.get('/reviews/me', {
        params: buildParams(params),
      })
      return getCollectionPayload(response)
    }, 'No se pudieron cargar tus reseñas.')
  },
  async createOrUpdateReview(payload) {
    return runRequest(async () => {
      const response = await axiosClient.post('/reviews', payload)
      return getPayloadData(response)
    }, 'No se pudo guardar la reseña.')
  },
  async updateReview(id, payload) {
    return runRequest(async () => {
      const response = await axiosClient.put(`/reviews/${id}`, payload)
      return getPayloadData(response)
    }, 'No se pudo actualizar la reseña.')
  },
  async deleteReview(id) {
    return runRequest(async () => {
      const response = await axiosClient.delete(`/reviews/${id}`)
      return getPayloadData(response)
    }, 'No se pudo eliminar la reseña.')
  },
}

export default reviewService
