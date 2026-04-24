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

export const reviewService = {
  async list(params) {
    return unwrapData(await request(`/reviews${buildQuery(params)}`))
  },
  async getMine(params) {
    return unwrapData(await request(`/reviews/me${buildQuery(params)}`))
  },
}

export default reviewService
