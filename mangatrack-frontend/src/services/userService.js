import { request, unwrapData } from './api.js'

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export const userService = {
  async getMyProfile() {
    return unwrapData(await request('/users/me/profile'))
  },
  async getMyLibrary(params) {
    const payload = await request(`/users/me/library${buildQuery(params)}`)

    return {
      ...unwrapData(payload),
      meta: payload?.meta || null,
    }
  },
}

export default userService
