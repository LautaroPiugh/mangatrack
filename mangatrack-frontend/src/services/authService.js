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
      const response = await axiosClient.post('/auth/register', registerPayload, {
        timeout: 20000,
      })
      return {
        payload: getPayloadData(response),
        message: response.data?.message,
      }
    }, 'No se pudo completar el registro.')

    if (data?.payload?.token && data?.payload?.user) {
      setStoredSession({ token: data.payload.token, user: data.payload.user })
    }

    return {
      data: data?.payload,
      message: data?.message,
      token: data?.payload?.token,
      user: data?.payload?.user,
    }
  },

  async verifyAccount(token) {
    const response = await runRequest(async () => (
      axiosClient.get('/auth/verify-email', {
        params: {
          token,
        },
      })
    ), 'No se pudo verificar la cuenta.')

    const data = getPayloadData(response)

    return {
      data,
      message: response.data?.message,
      user: data?.user,
    }
  },

  async resendVerification(payload) {
    const response = await runRequest(async () => (
      axiosClient.post('/auth/resend-verification', payload)
    ), 'No se pudo reenviar el correo de verificación.')

    return {
      data: getPayloadData(response),
      message: response.data?.message,
    }
  },

  async forgotPassword(payload) {
    const response = await runRequest(async () => (
      axiosClient.post('/auth/forgot-password', payload)
    ), 'No se pudo enviar el correo de recuperación.')

    return {
      data: getPayloadData(response),
      message: response.data?.message,
    }
  },

  async resetPassword(payload) {
    const response = await runRequest(async () => (
      axiosClient.post('/auth/reset-password', payload)
    ), 'No se pudo restablecer la contraseña.')

    return {
      data: getPayloadData(response),
      message: response.data?.message,
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
