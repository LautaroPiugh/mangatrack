import apiClient, { getResponseData } from './axiosClient.js'

const mangaApi = {
  list(params = {}) {
    return apiClient.get('/mangas', { params }).then(getResponseData)
  },
  getById(id) {
    return apiClient.get(`/mangas/${id}`).then(getResponseData)
  },
  create(payload) {
    return apiClient.post('/mangas', payload).then(getResponseData)
  },
  update(id, payload) {
    return apiClient.put(`/mangas/${id}`, payload).then(getResponseData)
  },
  remove(id) {
    return apiClient.delete(`/mangas/${id}`).then(getResponseData)
  },
  getReviews(id, params = {}) {
    return apiClient.get(`/mangas/${id}/reviews`, { params }).then(getResponseData)
  },
}

export default mangaApi
