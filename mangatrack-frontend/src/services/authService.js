import {
  clearStoredSession,
  setStoredSession,
} from './api.js'
import axiosClient from '../api/axiosClient.js'
import { getPayloadData, runRequest } from './http.js'

export const authService = {
  async login(credentials) {
    const data = await runRequest(async () => {
      const response = await axiosClient.post('/auth/login', credentials)
      return getPayloadData(response)
    }, 'No se pudo iniciar sesión.')

    if (data?.token && data?.user) {
      setStoredSession({ token: data.token, user: data.user })
    }

    return {
      data,
      token: data?.token,
      user: data?.user,
    }
  },

  async register(registerPayload) {
    const data = await runRequest(async () => {
      const response = await axiosClient.post('/auth/register', registerPayload)
      return getPayloadData(response)
    }, 'No se pudo completar el registro.')

    if (data?.token && data?.user) {
      setStoredSession({ token: data.token, user: data.user })
    }

    return {
      data,
      token: data?.token,
      user: data?.user,
    }
  },

  async verifyAccount(token) {
    const data = await runRequest(async () => {
      const response = await axiosClient.get(`/auth/verify/${token}`)
      return getPayloadData(response)
    }, 'No se pudo verificar la cuenta.')

    return {
      data,
      user: data?.user,
    }
  },

  async getMe() {
    const data = await runRequest(async () => {
      const response = await axiosClient.get('/auth/me')
      return getPayloadData(response)
    }, 'No se pudo obtener el usuario autenticado.')
    return data?.user ?? data
  },

  logout() {
    clearStoredSession()
  },
}

export default authService
