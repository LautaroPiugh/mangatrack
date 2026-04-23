import apiClient, { getResponseData } from './axiosClient.js'

const authApi = {
  register(payload) {
    return apiClient.post('/auth/register', payload).then(getResponseData)
  },
  login(payload) {
    return apiClient.post('/auth/login', payload).then(getResponseData)
  },
  verifyAccount(token) {
    return apiClient.get(`/auth/verify/${token}`).then(getResponseData)
  },
  getCurrentUser() {
    return apiClient.get('/auth/me').then(getResponseData)
  },
}

export default authApi
