import {
  clearStoredSession,
  request,
  setStoredSession,
  unwrapData,
} from './api.js'

export const authService = {
  async login(credentials) {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: credentials,
    })
    const data = unwrapData(payload)

    if (data?.token && data?.user) {
      setStoredSession({ token: data.token, user: data.user })
    }

    return {
      ...payload,
      data,
      token: data?.token,
      user: data?.user,
    }
  },

  async register(registerPayload) {
    const payload = await request('/auth/register', {
      method: 'POST',
      body: registerPayload,
    })
    const data = unwrapData(payload)

    if (data?.token && data?.user) {
      setStoredSession({ token: data.token, user: data.user })
    }

    return {
      ...payload,
      data,
      token: data?.token,
      user: data?.user,
    }
  },

  async verifyAccount(token) {
    const payload = await request(`/auth/verify/${token}`)
    const data = unwrapData(payload)

    return {
      ...payload,
      data,
      user: data?.user,
    }
  },

  async getMe() {
    const payload = await request('/auth/me')
    const data = unwrapData(payload)
    return data?.user ?? data
  },

  logout() {
    clearStoredSession()
  },
}

export default authService
