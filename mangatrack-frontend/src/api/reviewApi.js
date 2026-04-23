import apiClient, { getResponseData } from './axiosClient.js'

const reviewApi = {
  list(params = {}) {
    return apiClient.get('/reviews', { params }).then(getResponseData)
  },
  getMine(params = {}) {
    return apiClient.get('/reviews/me', { params }).then(getResponseData)
  },
  getById(id) {
    return apiClient.get(`/reviews/${id}`).then(getResponseData)
  },
  create(payload) {
    return apiClient.post('/reviews', payload).then(getResponseData)
  },
  update(id, payload) {
    return apiClient.put(`/reviews/${id}`, payload).then(getResponseData)
  },
  remove(id) {
    return apiClient.delete(`/reviews/${id}`).then(getResponseData)
  },
}

export default reviewApi
