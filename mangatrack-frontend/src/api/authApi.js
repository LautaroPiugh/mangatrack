import apiClient, { getResponseData } from './axiosClient.js'

const authApi = {
  register(payload) {
    return apiClient.post('/auth/register', payload, {
      timeout: 20000,
    }).then(getResponseData)
  },
  login(payload) {
    return apiClient.post('/auth/login', payload).then(getResponseData)
  },
  verifyAccount(token) {
    return apiClient.get('/auth/verify-email', {
      params: {
        token,
      },
    }).then(getResponseData)
  },
  resendVerification(payload) {
    return apiClient.post('/auth/resend-verification', payload).then(getResponseData)
  },
  forgotPassword(payload) {
    return apiClient.post('/auth/forgot-password', payload).then(getResponseData)
  },
  resetPassword(payload) {
    return apiClient.post('/auth/reset-password', payload).then(getResponseData)
  },
  getCurrentUser() {
    return apiClient.get('/auth/me').then(getResponseData)
  },
}

export default authApi
